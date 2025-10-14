import React, { useState, useEffect } from 'react';
import { MapPin, Users, CheckCircle, XCircle, AlertTriangle, Navigation, Plus, CreditCard as Edit2, Trash2 } from 'lucide-react';
import { useEmployee } from '../contexts/EmployeeContext';
import { useAuth } from '../contexts/AuthContext';
import { notificationService } from '../services/notificationService';

interface LocationRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  address: string;
  isWithinOffice: boolean;
  accuracy: number;
  type: 'check-in' | 'check-out' | 'location-update';
  deviceInfo: string;
}

interface OfficeLocation {
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
}

const LocationAttendance = () => {
  const { employees } = useEmployee();
  const { user } = useAuth();
  const [locationRecords, setLocationRecords] = useState<LocationRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<OfficeLocation | null>(null);
  const [locationFormData, setLocationFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    radius: '100'
  });

  // Office locations (configurable)
  const [officeLocations, setOfficeLocations] = useState<OfficeLocation[]>([
    {
      name: 'Main Office',
      latitude: 40.7128, // Example: New York coordinates
      longitude: -74.0060,
      radius: 100 // 100 meters radius
    },
    {
      name: 'Branch Office',
      latitude: 40.7589,
      longitude: -73.9851,
      radius: 150
    }
  ]);

  // Mock location records
  useEffect(() => {
    const mockRecords: LocationRecord[] = [
      {
        id: '1',
        employeeId: '1',
        employeeName: 'Abiya Sajan',
        timestamp: new Date().toISOString(),
        latitude: 40.7128,
        longitude: -74.0060,
        address: '123 Main St, New York, NY',
        isWithinOffice: true,
        accuracy: 5,
        type: 'check-in',
        deviceInfo: 'iPhone 14 Pro'
      },
      {
        id: '2',
        employeeId: '2',
        employeeName: 'Sandra Sivan',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        latitude: 40.7589,
        longitude: -73.9851,
        address: '456 Broadway, New York, NY',
        isWithinOffice: true,
        accuracy: 8,
        type: 'check-in',
        deviceInfo: 'Samsung Galaxy S23'
      },
      {
        id: '3',
        employeeId: '3',
        employeeName: 'Abin Jirshad',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        latitude: 40.7500,
        longitude: -73.9900,
        address: '789 Park Ave, New York, NY',
        isWithinOffice: false,
        accuracy: 12,
        type: 'location-update',
        deviceInfo: 'iPhone 13'
      }
    ];
    setLocationRecords(mockRecords);
  }, []);

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
  const isWithinOfficeRadius = (lat: number, lon: number): { isWithin: boolean; office: OfficeLocation | null; distance: number } => {
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

  // Get current location for form
  const getCurrentLocationForForm = async () => {
    try {
      setIsGettingLocation(true);
      setLocationError('');

      const position = await getCurrentLocation();

      setLocationFormData({
        ...locationFormData,
        latitude: position.coords.latitude.toString(),
        longitude: position.coords.longitude.toString()
      });

      alert(`✅ Location updated! Coordinates: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);

    } catch (error) {
      setLocationError(error instanceof Error ? error.message : 'Failed to get location');
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Handle location form submission
  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newLocation: OfficeLocation = {
      name: locationFormData.name,
      latitude: parseFloat(locationFormData.latitude),
      longitude: parseFloat(locationFormData.longitude),
      radius: parseInt(locationFormData.radius)
    };

    if (editingLocation) {
      // Update existing location
      setOfficeLocations(prev => prev.map(loc =>
        loc.name === editingLocation.name ? newLocation : loc
      ));
    } else {
      // Add new location
      setOfficeLocations(prev => [...prev, newLocation]);
    }

    resetLocationForm();
  };

  // Reset location form
  const resetLocationForm = () => {
    setLocationFormData({
      name: '',
      latitude: '',
      longitude: '',
      radius: '100'
    });
    setEditingLocation(null);
    setIsLocationModalOpen(false);
  };

  // Handle edit location
  const handleEditLocation = (location: OfficeLocation) => {
    setEditingLocation(location);
    setLocationFormData({
      name: location.name,
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      radius: location.radius.toString()
    });
    setIsLocationModalOpen(true);
  };

  // Handle delete location
  const handleDeleteLocation = (locationName: string) => {
    if (window.confirm('Are you sure you want to delete this office location?')) {
      setOfficeLocations(prev => prev.filter(loc => loc.name !== locationName));
    }
  };

  // Start location tracking
  const startLocationTracking = async () => {
    try {
      setLocationError('');
      setIsTracking(true);

      const position = await getCurrentLocation();
      setCurrentLocation(position);

      const { isWithin, office, distance } = isWithinOfficeRadius(
        position.coords.latitude,
        position.coords.longitude
      );

      // Simulate adding a location record
      const newRecord: LocationRecord = {
        id: Date.now().toString(),
        employeeId: user?.id || '',
        employeeName: user?.name || '',
        timestamp: new Date().toISOString(),
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        address: 'Current Location', // In real app, use reverse geocoding
        isWithinOffice: isWithin,
        accuracy: position.coords.accuracy,
        type: 'location-update',
        deviceInfo: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop'
      };

      setLocationRecords(prev => [newRecord, ...prev]);

      if (isWithin) {
        alert(`✅ Location verified! You are within ${office?.name} (${distance.toFixed(0)}m away)`);
      } else {
        alert(`❌ You are outside office premises. Distance to ${office?.name}: ${distance.toFixed(0)}m`);

        try {
          await notificationService.createNotification({
            type: 'location_alert',
            title: 'Employee Outside Office',
            message: `${user?.name} is outside office premises. Distance to ${office?.name}: ${distance.toFixed(0)}m`,
            employee_id: user?.id || '',
            employee_name: user?.name || '',
            related_id: newRecord.id,
            metadata: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              distance: distance.toFixed(0),
              office: office?.name,
              accuracy: position.coords.accuracy
            }
          });
        } catch (error) {
          console.error('Failed to create notification:', error);
        }
      }

    } catch (error) {
      setLocationError(error instanceof Error ? error.message : 'Failed to get location');
    } finally {
      setIsTracking(false);
    }
  };

  // Filter records
  const filteredRecords = locationRecords.filter(record => {
    const matchesDate = record.timestamp.startsWith(selectedDate);
    const matchesEmployee = !selectedEmployee || record.employeeId === selectedEmployee;
    return matchesDate && matchesEmployee;
  });

  // Statistics
  const todayRecords = locationRecords.filter(r => r.timestamp.startsWith(selectedDate));
  const employeesInOffice = new Set(
    todayRecords
      .filter(r => r.isWithinOffice && r.type === 'check-in')
      .map(r => r.employeeId)
  ).size;

  const employeesOutsideOffice = new Set(
    todayRecords
      .filter(r => !r.isWithinOffice)
      .map(r => r.employeeId)
  ).size;

  const totalLocationUpdates = todayRecords.length;

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-gray-500">Access denied. Admin privileges required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Location-Based Attendance</h1>
          <p className="text-gray-600">Track employee presence with GPS location verification</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </button>
          <button
            onClick={startLocationTracking}
            disabled={isTracking}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isTracking ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Getting Location...
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4 mr-2" />
                Check My Location
              </>
            )}
          </button>
        </div>
      </div>

      {/* Location Error */}
      {locationError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span>{locationError}</span>
          </div>
        </div>
      )}

      {/* Office Locations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Office Locations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {officeLocations.map((office, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="font-medium text-gray-900">{office.name}</h3>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditLocation(office)}
                    className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteLocation(office.name)}
                    className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">
                Coordinates: {office.latitude.toFixed(4)}, {office.longitude.toFixed(4)}
              </p>
              <p className="text-sm text-gray-600">
                Radius: {office.radius}m
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Location Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingLocation ? 'Edit Office Location' : 'Add Office Location'}
              </h2>
              <button
                onClick={resetLocationForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleLocationSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Office Name</label>
                  <input
                    type="text"
                    required
                    value={locationFormData.name}
                    onChange={(e) => setLocationFormData({ ...locationFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Main Office, Downtown Branch"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={locationFormData.latitude}
                      onChange={(e) => setLocationFormData({ ...locationFormData, latitude: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="40.7128"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={locationFormData.longitude}
                      onChange={(e) => setLocationFormData({ ...locationFormData, longitude: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="-74.0060"
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={getCurrentLocationForForm}
                    disabled={isGettingLocation}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Radius (meters)</label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    required
                    value={locationFormData.radius}
                    onChange={(e) => setLocationFormData({ ...locationFormData, radius: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="100"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetLocationForm}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingLocation ? 'Update Location' : 'Add Location'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Location Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Office</p>
              <p className="text-2xl font-bold text-gray-900">{employeesInOffice}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Outside Office</p>
              <p className="text-2xl font-bold text-gray-900">{employeesOutsideOffice}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Location Updates</p>
              <p className="text-2xl font-bold text-gray-900">{totalLocationUpdates}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Employees</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Current Location Display */}
      {currentLocation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Navigation className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="font-medium text-blue-900">Your Current Location</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Latitude:</span>
              <span className="ml-2 font-mono">{currentLocation.coords.latitude.toFixed(6)}</span>
            </div>
            <div>
              <span className="text-blue-700">Longitude:</span>
              <span className="ml-2 font-mono">{currentLocation.coords.longitude.toFixed(6)}</span>
            </div>
            <div>
              <span className="text-blue-700">Accuracy:</span>
              <span className="ml-2">{currentLocation.coords.accuracy.toFixed(0)}m</span>
            </div>
          </div>
        </div>
      )}

      {/* Location Records Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Location Records</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Office Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Accuracy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-xs">
                          {record.employeeName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{record.employeeName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(record.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>
                      <div className="font-mono text-xs text-gray-600">
                        {record.latitude.toFixed(4)}, {record.longitude.toFixed(4)}
                      </div>
                      <div className="text-sm">{record.address}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {record.isWithinOffice ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            In Office
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-600 mr-2" />
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Outside
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ±{record.accuracy.toFixed(0)}m
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${record.type === 'check-in' ? 'bg-blue-100 text-blue-800' :
                      record.type === 'check-out' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                      {record.type.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.deviceInfo}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-900 mb-2">Location Tracking Instructions</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Employees must enable location services in their browser</li>
              <li>• Location accuracy depends on GPS signal and device capabilities</li>
              <li>• Office radius can be configured in the system settings</li>
              <li>• Location data is used only for attendance verification</li>
              <li>• All location data is encrypted and stored securely</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationAttendance;