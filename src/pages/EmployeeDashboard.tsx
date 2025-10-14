import React from 'react';
import { User, Calendar, DollarSign, Clock, Check, X, Building2, MapPin, Navigation, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEmployee } from '../contexts/EmployeeContext';
import EmployeeTasks from '../components/EmployeeTasks';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { employees, leaves, departments } = useEmployee();
  const [currentLocation, setCurrentLocation] = React.useState<GeolocationPosition | null>(null);
  const [locationError, setLocationError] = React.useState<string>('');
  const [isGettingLocation, setIsGettingLocation] = React.useState(false);
  const [locationStatus, setLocationStatus] = React.useState<'unknown' | 'in-office' | 'outside-office'>('unknown');
  const [isAddLocationModalOpen, setIsAddLocationModalOpen] = React.useState(false);
  const [newLocationFormData, setNewLocationFormData] = React.useState({
    name: '',
    latitude: '',
    longitude: '',
    radius: '100',
    description: ''
  });
  const [isSubmittingLocation, setIsSubmittingLocation] = React.useState(false);

  // Get current employee data
  const currentEmployee = employees.find(emp => emp.id === user?.id);
  const employeeLeaves = leaves.filter(leave => leave.employeeId === user?.id);
  const employeeDepartment = departments.find(dept => dept.name === currentEmployee?.department);

  if (!currentEmployee) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-gray-500">Employee data not found</p>
        </div>
      </div>
    );
  }

  const leaveStats = {
    total: employeeLeaves.length,
    approved: employeeLeaves.filter(l => l.status === 'approved').length,
    pending: employeeLeaves.filter(l => l.status === 'pending').length,
    rejected: employeeLeaves.filter(l => l.status === 'rejected').length
  };


  const recentLeaves = employeeLeaves
    .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
    .slice(0, 3);

  // Office locations (should match the ones from LocationAttendance)
  const officeLocations = [
    {
      name: 'Main Office',
      latitude: 40.7128,
      longitude: -74.0060,
      radius: 100
    },
    {
      name: 'Branch Office',
      latitude: 40.7589,
      longitude: -73.9851,
      radius: 150
    }
  ];

  // Calculate distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // Check if location is within office premises
  const isWithinOfficeRadius = (lat: number, lon: number): { isWithin: boolean; office: any | null; distance: number } => {
    for (const office of officeLocations) {
      const distance = calculateDistance(lat, lon, office.latitude, office.longitude);
      if (distance <= office.radius) {
        return { isWithin: true, office, distance };
      }
    }

    // Find closest office
    const distances = officeLocations.map(office => ({
      office,
      distance: calculateDistance(lat, lon, office.latitude, office.longitude)
    }));

    const closest = distances.reduce((min, current) =>
      current.distance < min.distance ? current : min
    );

    return { isWithin: false, office: closest.office, distance: closest.distance };
  };

  // Get current location
  const getCurrentLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve(position);
        },
        (error) => {
          let errorMessage = 'Unknown error occurred';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  // Update location
  const updateMyLocation = async () => {
    try {
      setIsGettingLocation(true);
      setLocationError('');

      const position = await getCurrentLocation();
      setCurrentLocation(position);

      const { isWithin, office, distance } = isWithinOfficeRadius(
        position.coords.latitude,
        position.coords.longitude
      );

      setLocationStatus(isWithin ? 'in-office' : 'outside-office');

      if (isWithin) {
        alert(`✅ Location updated! You are at ${office?.name} (${distance.toFixed(0)}m from center)`);
      } else {
        alert(`📍 Location updated! You are ${distance.toFixed(0)}m away from ${office?.name}`);
      }

    } catch (error) {
      setLocationError(error instanceof Error ? error.message : 'Failed to get location');
      setLocationStatus('unknown');
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Get current location for new office form
  const getCurrentLocationForNewOffice = async () => {
    try {
      setIsGettingLocation(true);
      setLocationError('');

      const position = await getCurrentLocation();

      setNewLocationFormData({
        ...newLocationFormData,
        latitude: position.coords.latitude.toString(),
        longitude: position.coords.longitude.toString()
      });

      alert(`✅ Location captured! Coordinates: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);

    } catch (error) {
      setLocationError(error instanceof Error ? error.message : 'Failed to get location');
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Handle new location submission
  const handleNewLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmittingLocation(true);

      // In a real app, this would make an API call to submit the location request
      // For now, we'll just show a success message

      const locationData = {
        name: newLocationFormData.name,
        latitude: parseFloat(newLocationFormData.latitude),
        longitude: parseFloat(newLocationFormData.longitude),
        radius: parseInt(newLocationFormData.radius),
        description: newLocationFormData.description,
        submittedBy: currentEmployee.name,
        submittedAt: new Date().toISOString(),
        status: 'pending' // Would be reviewed by admin
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      alert(`✅ Location request submitted successfully!\n\nLocation: ${locationData.name}\nCoordinates: ${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)}\nRadius: ${locationData.radius}m\n\nYour request will be reviewed by an administrator.`);

      resetNewLocationForm();

    } catch (error) {
      alert('❌ Failed to submit location request. Please try again.');
    } finally {
      setIsSubmittingLocation(false);
    }
  };

  // Reset new location form
  const resetNewLocationForm = () => {
    setNewLocationFormData({
      name: '',
      latitude: '',
      longitude: '',
      radius: '100',
      description: ''
    });
    setIsAddLocationModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {currentEmployee.name}!</h1>
        <p className="text-gray-600">Here's your personal dashboard overview</p>
      </div>

      {/* Employee Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-6">
          {currentEmployee.profilePicture ? (
            <img
              src={currentEmployee.profilePicture}
              alt={currentEmployee.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-blue-100"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextElementSibling) {
                  (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                }
              }}
            />
          ) : null}
          <div className={`w-20 h-20 bg-green-100 rounded-full flex items-center justify-center ${currentEmployee.profilePicture ? 'hidden' : ''}`}>
            <span className="text-green-600 font-bold text-2xl">
              {currentEmployee.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">{currentEmployee.name}</h2>
            <p className="text-gray-600 mb-2">{currentEmployee.position}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center">
                <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600">Department:</span>
                <span className="ml-2 font-medium text-gray-900">{currentEmployee.department}</span>
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600">Employee ID:</span>
                <span className="ml-2 font-medium text-gray-900">#{currentEmployee.id}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600">Joined:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {new Date(currentEmployee.joinDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Status Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <MapPin className="h-6 w-6 text-green-600 mr-3" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">My Location Status</h2>
              <p className="text-sm text-gray-600">Track your location for attendance verification</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setIsAddLocationModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Add Location
            </button>
            <button
              onClick={updateMyLocation}
              disabled={isGettingLocation}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGettingLocation ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Getting Location...
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4 mr-2" />
                  Update My Location
                </>
              )}
            </button>
          </div>
        </div>

        {/* Location Error */}
        {locationError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span>{locationError}</span>
            </div>
          </div>
        )}

        {/* Current Location Display */}
        {currentLocation && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Current Coordinates</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Latitude:</span>
                  <span className="font-mono text-gray-900">{currentLocation.coords.latitude.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Longitude:</span>
                  <span className="font-mono text-gray-900">{currentLocation.coords.longitude.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Accuracy:</span>
                  <span className="text-gray-900">±{currentLocation.coords.accuracy.toFixed(0)}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Updated:</span>
                  <span className="text-gray-900">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Office Status</h3>
              <div className="flex items-center space-x-3">
                {locationStatus === 'in-office' && (
                  <>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-green-700 font-medium">Inside Office Premises</span>
                  </>
                )}
                {locationStatus === 'outside-office' && (
                  <>
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-red-700 font-medium">Outside Office Premises</span>
                  </>
                )}
                {locationStatus === 'unknown' && (
                  <>
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span className="text-gray-600 font-medium">Location Unknown</span>
                  </>
                )}
              </div>

              {currentLocation && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Tip:</strong> Update your location when you arrive at or leave the office for accurate attendance tracking.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Office Locations Info */}
        {!currentLocation && (
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Office Locations</h3>
            <div className="space-y-2">
              {officeLocations.map((office, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-700">{office.name}</span>
                  </div>
                  <span className="text-gray-500">Radius: {office.radius}m</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Click "Update My Location" to check if you're within office premises
            </p>
          </div>
        )}
      </div>

      {/* Add New Location Modal */}
      {isAddLocationModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Request New Office Location</h2>
              <button
                onClick={resetNewLocationForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleNewLocationSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location Name *</label>
                  <input
                    type="text"
                    required
                    value={newLocationFormData.name}
                    onChange={(e) => setNewLocationFormData({ ...newLocationFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Downtown Branch, Remote Office"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newLocationFormData.description}
                    onChange={(e) => setNewLocationFormData({ ...newLocationFormData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={2}
                    placeholder="Brief description of this location (optional)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={newLocationFormData.latitude}
                      onChange={(e) => setNewLocationFormData({ ...newLocationFormData, latitude: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="40.7128"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={newLocationFormData.longitude}
                      onChange={(e) => setNewLocationFormData({ ...newLocationFormData, longitude: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="-74.0060"
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={getCurrentLocationForNewOffice}
                    disabled={isGettingLocation}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isGettingLocation ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Getting Location...
                      </>
                    ) : (
                      <>
                        <Navigation className="h-4 w-4 mr-2" />
                        Use My Current Location
                      </>
                    )}
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Suggested Radius (meters) *</label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    required
                    value={newLocationFormData.radius}
                    onChange={(e) => setNewLocationFormData({ ...newLocationFormData, radius: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Recommended radius for attendance verification (10-1000m)</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-900 mb-1">Location Request Process</h3>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Your location request will be submitted for admin review</li>
                        <li>• Include accurate coordinates and appropriate radius</li>
                        <li>• Admin will verify and approve the location</li>
                        <li>• You'll be notified once the location is active</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetNewLocationForm}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingLocation}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmittingLocation ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      'Submit Request'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Employee Tasks */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <EmployeeTasks />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Salary</p>
              <p className="text-2xl font-bold text-gray-900">${currentEmployee.salary.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Leaves</p>
              <p className="text-2xl font-bold text-gray-900">{leaveStats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Leaves</p>
              <p className="text-2xl font-bold text-gray-900">{leaveStats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Check className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved Leaves</p>
              <p className="text-2xl font-bold text-gray-900">{leaveStats.approved}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Leave Summary</h2>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-50">
              <div className="p-2 rounded-lg bg-blue-100">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Applied</p>
                <p className="text-xl font-bold text-gray-900">{leaveStats.total}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-emerald-50">
              <div className="p-2 rounded-lg bg-blue-100">
                <Check className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-xl font-bold text-gray-900">{leaveStats.approved}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-lime-50">
              <div className="p-2 rounded-lg bg-blue-100">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-xl font-bold text-gray-900">{leaveStats.pending}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-red-50">
              <div className="p-2 rounded-lg bg-red-100">
                <X className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-xl font-bold text-gray-900">{leaveStats.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Department Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Department Info</h2>
            <Building2 className="h-5 w-5 text-gray-400" />
          </div>
          {employeeDepartment && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 text-lg">{employeeDepartment.name}</h3>
                <p className="text-gray-600 text-sm mt-1">{employeeDepartment.description}</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Department Manager</span>
                  <span className="font-medium text-gray-900">{employeeDepartment.manager}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Total Employees</span>
                  <span className="font-medium text-green-600">{employeeDepartment.employeeCount}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Leave Requests */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Leave Requests</h2>
          <Calendar className="h-5 w-5 text-gray-400" />
        </div>
        {recentLeaves.length > 0 ? (
          <div className="space-y-4">
            {recentLeaves.map((leave) => (
              <div key={leave.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                      {leave.type}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${leave.status === 'approved' ? 'bg-green-100 text-green-800' :
                      leave.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                      {leave.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">{leave.reason}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{leave.days} day{leave.days > 1 ? 's' : ''}</p>
                  <p className="text-xs text-gray-500">Applied: {new Date(leave.appliedDate).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No leave requests found</p>
          </div>
        )}
      </div>
    </div>
  );
}