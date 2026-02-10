//
//  LocationManager.swift
//  NagrikMitra2
//
//  Location services manager
//

import Foundation
import CoreLocation
import Combine

class LocationManager: NSObject, ObservableObject {
    @Published var location: CLLocation?
    @Published var locationString: String = ""
    @Published var authorizationStatus: CLAuthorizationStatus = .notDetermined
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let locationManager = CLLocationManager()
    
    override init() {
        super.init()
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        authorizationStatus = locationManager.authorizationStatus
    }
    
    func requestPermission() {
        locationManager.requestWhenInUseAuthorization()
    }
    
    func getCurrentLocation() {
        guard locationManager.authorizationStatus == .authorizedWhenInUse ||
              locationManager.authorizationStatus == .authorizedAlways else {
            requestPermission()
            return
        }
        
        isLoading = true
        errorMessage = nil
        locationManager.requestLocation()
    }
    
    func reverseGeocode(location: CLLocation) async throws -> String {
        let geocoder = CLGeocoder()
        let placemarks = try await geocoder.reverseGeocodeLocation(location)
        
        guard let placemark = placemarks.first else {
            throw LocationError.noAddress
        }
        
        var addressComponents: [String] = []
        
        if let name = placemark.name {
            addressComponents.append(name)
        }
        if let locality = placemark.locality {
            addressComponents.append(locality)
        }
        if let administrativeArea = placemark.administrativeArea {
            addressComponents.append(administrativeArea)
        }
        if let postalCode = placemark.postalCode {
            addressComponents.append(postalCode)
        }
        
        return addressComponents.joined(separator: ", ")
    }
}

extension LocationManager: CLLocationManagerDelegate {
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.first else { return }
        
        Task { @MainActor in
            self.location = location
            
            do {
                let address = try await reverseGeocode(location: location)
                self.locationString = address
                self.isLoading = false
            } catch {
                self.errorMessage = "Failed to get address"
                self.locationString = "\(location.coordinate.latitude), \(location.coordinate.longitude)"
                self.isLoading = false
            }
        }
    }
    
    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        Task { @MainActor in
            self.errorMessage = error.localizedDescription
            self.isLoading = false
        }
    }
    
    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        Task { @MainActor in
            self.authorizationStatus = manager.authorizationStatus
        }
    }
}

enum LocationError: Error, LocalizedError {
    case noAddress
    
    var errorDescription: String? {
        switch self {
        case .noAddress:
            return "Could not find address for location"
        }
    }
}
