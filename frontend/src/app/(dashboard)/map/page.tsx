"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { MapPin, Search, Filter, Navigation, Phone, Clock, Star, Route, Plus, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GoogleMap, Marker, useLoadScript, DirectionsRenderer } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: -26.2041,
  lng: 28.0473
};

interface Route {
  id: number;
  name: string;
  source: string;
  destination: string;
  category: string;
  frequency: string;
  coordinates: {
    source: { lat: number; lng: number };
    destination: { lat: number; lng: number };
  };
}

const sampleRoutes: Route[] = [
  {
    id: 4,
    name: "Garden Route",
    source: "Mossel Bay",
    destination: "Storms River",
    category: "Vacation",
    frequency: "Yearly",
    coordinates: {
      source: { lat: -34.1833, lng: 22.1333 },
      destination: { lat: -34.0167, lng: 23.9000 }
    }
  }
];

export default function Map() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [center, setCenter] = useState(defaultCenter)
  const [zoom, setZoom] = useState(12)
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null)
  const [isAddingRoute, setIsAddingRoute] = useState(false)
  const [newRoute, setNewRoute] = useState<Omit<Route, 'id' | 'coordinates'>>({
    name: "",
    source: "",
    destination: "",
    category: "",
    frequency: "",
  })
  const [routes, setRoutes] = useState<Route[]>(sampleRoutes)
  const sourceAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const destAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const sourceInputRef = useRef<HTMLInputElement>(null)
  const destInputRef = useRef<HTMLInputElement>(null)

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ['places'],
  });

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    const bounds = new window.google.maps.LatLngBounds();
    routes.forEach(route => {
      bounds.extend(route.coordinates.source);
      bounds.extend(route.coordinates.destination);
    });
    map.fitBounds(bounds);
    setMap(map)
  }, [routes])

  const onUnmount = useCallback(function callback() {
    setMap(null)
  }, [])

  useEffect(() => {
    if (isLoaded && map && sourceInputRef.current && destInputRef.current) {
      // Initialize autocomplete for source input
      sourceAutocompleteRef.current = new google.maps.places.Autocomplete(
        sourceInputRef.current,
        {
          fields: ["formatted_address", "geometry"],
          types: ["address"]
        }
      );
      sourceAutocompleteRef.current.bindTo('bounds', map);
      
      // Initialize autocomplete for destination input
      destAutocompleteRef.current = new google.maps.places.Autocomplete(
        destInputRef.current,
        {
          fields: ["formatted_address", "geometry"],
          types: ["address"]
        }
      );
      destAutocompleteRef.current.bindTo('bounds', map);

      // Add listeners for when a place is selected
      sourceAutocompleteRef.current.addListener("place_changed", () => {
        const place = sourceAutocompleteRef.current?.getPlace();
        if (place?.formatted_address && place.geometry?.location) {
          setNewRoute(prev => ({
            ...prev,
            source: place.formatted_address as string
          }));
        }
      });

      destAutocompleteRef.current.addListener("place_changed", () => {
        const place = destAutocompleteRef.current?.getPlace();
        if (place?.formatted_address && place.geometry?.location) {
          setNewRoute(prev => ({
            ...prev,
            destination: place.formatted_address as string
          }));
        }
      });
    }

    return () => {
      // Clean up autocomplete instances
      if (sourceAutocompleteRef.current) {
        google.maps.event.clearInstanceListeners(sourceAutocompleteRef.current);
      }
      if (destAutocompleteRef.current) {
        google.maps.event.clearInstanceListeners(destAutocompleteRef.current);
      }
    };
  }, [isLoaded, map]);

  useEffect(() => {
    // Load routes from local storage if available
    const storedRoutes = localStorage.getItem("routes");
    if (storedRoutes) {
      setRoutes(JSON.parse(storedRoutes));
    }
  }, []);

  useEffect(() => {
    // Save routes to local storage whenever they change
    localStorage.setItem("routes", JSON.stringify(routes));
  }, [routes]);

  const calculateRoute = useCallback((route: Route) => {
    if (!isLoaded) return;

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: route.coordinates.source,
        destination: route.coordinates.destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
        } else {
          console.error(`error fetching directions ${result}`);
        }
      }
    );
  }, [isLoaded]);

  const handleRouteClick = (routeId: number) => {
    setSelectedRoute(selectedRoute === routeId ? null : routeId)
    const route = routes.find(r => r.id === routeId)
    if (route && map) {
      calculateRoute(route);
      
      // Center the map on the midpoint between source and destination
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(route.coordinates.source);
      bounds.extend(route.coordinates.destination);
      map.fitBounds(bounds);
      setZoom(12)
    }
  }

  const handleAddRoute = () => {
    setIsAddingRoute(true);
  }

  const handleCancelAddRoute = () => {
    setIsAddingRoute(false);
    setNewRoute({
      name: "",
      source: "",
      destination: "",
      category: "",
      frequency: "",
    });
  }

  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!isLoaded) {
        reject("Google Maps not loaded");
        return;
      }

      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === "OK" && results?.[0]?.geometry?.location) {
          resolve({
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng()
          });
        } else {
          reject(`Geocode was not successful for the following reason: ${status}`);
        }
      });
    });
  };

  const handleSaveRoute = async () => {
    if (!newRoute.name || !newRoute.source || !newRoute.destination) return;

    try {
      // Geocode both addresses to get coordinates
      const [sourceCoords, destCoords] = await Promise.all([
        geocodeAddress(newRoute.source),
        geocodeAddress(newRoute.destination)
      ]);

      const completeRoute: Route = {
        id: Date.now(),
        name: newRoute.name,
        source: newRoute.source,
        destination: newRoute.destination,
        category: newRoute.category,
        frequency: newRoute.frequency,
        coordinates: {
          source: sourceCoords,
          destination: destCoords
        }
      };

      setRoutes((prevRoutes) => [...prevRoutes, completeRoute]);
      setIsAddingRoute(false);
      setNewRoute({
        name: "",
        source: "",
        destination: "",
        category: "",
        frequency: "",
      });
    } catch (error) {
      console.error("Error saving route:", error);
      alert("Could not find coordinates for one of the addresses. Please check the addresses and try again.");
    }
  }

  const filteredRoutes = routes.filter((route) => {
    const matchesSearch =
      route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.destination.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === "all" || route.category.toLowerCase() === selectedCategory.toLowerCase()
    return matchesSearch && matchesCategory
  })

  const categories = ["all", ...Array.from(new Set(routes.map((route) => route.category)))]

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps...</div>;

  return (
    <div className="bg-background">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Routes</h1>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search routes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardContent className="p-0 h-full">
                <div className="relative h-[500px] lg:h-full bg-background rounded-lg overflow-hidden">
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={zoom}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    options={{
                      streetViewControl: false,
                      mapTypeControl: false,
                      fullscreenControl: false,
                    }}
                  >
                    {filteredRoutes.map((route) => (
                      <>
                        <Marker
                          key={`source-${route.id}`}
                          position={route.coordinates.source}
                          onClick={() => handleRouteClick(route.id)}
                          icon={{
                            url: `https://maps.google.com/mapfiles/ms/icons/${selectedRoute === route.id ? 'red-dot.png' : 'green-dot.png'}`,
                            scaledSize: new google.maps.Size(30, 30)
                          }}
                        />
                        <Marker
                          key={`dest-${route.id}`}
                          position={route.coordinates.destination}
                          onClick={() => handleRouteClick(route.id)}
                          icon={{
                            url: `https://maps.google.com/mapfiles/ms/icons/${selectedRoute === route.id ? 'red-dot.png' : 'blue-dot.png'}`,
                            scaledSize: new google.maps.Size(30, 30)
                          }}
                        />
                        {selectedRoute === route.id && directions && (
                          <DirectionsRenderer directions={directions} />
                        )}
                      </>
                    ))}
                  </GoogleMap>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Routes List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">My Routes ({filteredRoutes.length})</h2>
              <Button size="sm" onClick={handleAddRoute}>
                <Plus className="h-4 w-4 mr-2" />
                Add Route
              </Button>
            </div>

            {isAddingRoute && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Route</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Route name (e.g. Work Commute)"
                    value={newRoute.name}
                    onChange={(e) => setNewRoute({...newRoute, name: e.target.value})}
                  />
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      ref={sourceInputRef}
                      id="source-input"
                      placeholder="Source address"
                      value={newRoute.source}
                      onChange={(e) => setNewRoute({...newRoute, source: e.target.value})}
                      className="pl-10"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      ref={destInputRef}
                      id="destination-input"
                      placeholder="Destination address"
                      value={newRoute.destination}
                      onChange={(e) => setNewRoute({...newRoute, destination: e.target.value})}
                      className="pl-10"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Select 
                      value={newRoute.category} 
                      onValueChange={(value) => setNewRoute({...newRoute, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Commute">Commute</SelectItem>
                        <SelectItem value="Leisure">Leisure</SelectItem>
                        <SelectItem value="Shopping">Shopping</SelectItem>
                        <SelectItem value="Vacation">Vacation</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select 
                      value={newRoute.frequency} 
                      onValueChange={(value) => setNewRoute({...newRoute, frequency: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Daily">Daily</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Yearly">Yearly</SelectItem>
                        <SelectItem value="Occasionally">Occasionally</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      onClick={handleCancelAddRoute}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="flex-1" 
                      onClick={handleSaveRoute}
                      disabled={!newRoute.name || !newRoute.source || !newRoute.destination}
                    >
                      Save Route
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {filteredRoutes.map((route) => (
                <Card
                  key={route.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedRoute === route.id ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => handleRouteClick(route.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{route.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Route className="h-3 w-3" />
                          <span className="text-sm">{route.source} → {route.destination}</span>
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">{route.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{route.frequency}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                          Directions
                        </Button>
                        <Button size="sm" className="flex-1">
                          Share
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredRoutes.length === 0 && !isAddingRoute && (
              <Card>
                <CardContent className="py-8 text-center">
                  <Route className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No routes found</h3>
                  <p className="text-muted-foreground">Try adding a new route or adjust your search</p>
                  <Button className="mt-4" onClick={handleAddRoute}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Route
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}