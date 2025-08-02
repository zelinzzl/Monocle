"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  Clock,
  Route as RouteIcon,
  MapPin,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  useLoadScript,
} from "@react-google-maps/api";
import { useRoutes } from "@/hooks/useRoutes";
import { useDirections } from "@/hooks/useDirections";
import { geocodeAddress, reverseGeocode, Route } from "@/services/routeService";
import { useAuth } from "@/context/auth-context";
import { P } from "@/components/ui/typography";

const containerStyle = { width: "100%", height: "100%", minHeight: "500px" };
const defaultCenter = { lat: -26.2041, lng: 28.0473 };

export default function RoutePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [isAddingRoute, setIsAddingRoute] = useState(false);
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [originalRoute, setOriginalRoute] = useState<Omit<Route, "coordinates"> | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  // State for drag-and-drop markers
  const [markers, setMarkers] = useState<{
    source: google.maps.LatLngLiteral | null;
    destination: google.maps.LatLngLiteral | null;
  }>({ source: null, destination: null });

  const [newRoute, setNewRoute] = useState<Omit<Route, "id" | "coordinates">>({
    title: "",
    origin: "",
    destination: "",
    category: "",
    frequency: "",
    user_id: user?.id || "",
  });

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places", "geometry"],
  });

  const { routes, addRoute, removeRoute, editRoute, loading } = useRoutes(
    user?.id || ""
  );
  const { directions, distance, calculateRoute } = useDirections(isLoaded);

  // Initialize map
  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    setMap(map);
  }, []);

  // Handle map click for adding markers
  const handleMapClick = useCallback(async (e: google.maps.MapMouseEvent) => {
    if (!isAddingRoute || !mapRef.current || !e.latLng) return;

    const position = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    const address = await reverseGeocode(position);

    if (!markers.source) {
      setMarkers(prev => ({ ...prev, source: position }));
      setNewRoute(prev => ({ ...prev, origin: address }));
    } else if (!markers.destination) {
      setMarkers(prev => ({ ...prev, destination: position }));
      setNewRoute(prev => ({ ...prev, destination: address }));
    }
  }, [isAddingRoute, markers]);

  // Handle address input changes
  const handleAddressChange = async (type: 'origin' | 'destination', value: string) => {
    setNewRoute(prev => ({ ...prev, [type]: value }));
    
    // If the input is cleared, clear the corresponding marker
    if (!value.trim()) {
      setMarkers(prev => ({ ...prev, [type === 'origin' ? 'source' : 'destination']: null }));
      return;
    }

    // Geocode the address when user stops typing (you might want to debounce this)
    try {
      const position = await geocodeAddress(value);
      if (position) {
        setMarkers(prev => ({
          ...prev,
          [type === 'origin' ? 'source' : 'destination']: position
        }));
        
        // Center map on the new location
        if (mapRef.current) {
          mapRef.current.panTo(position);
        }
      }
    } catch (error) {
      console.error(`Failed to geocode ${type}:`, error);
      // Keep the text input value even if geocoding fails
    }
  };

  // Reset markers when cancelling or completing route addition
  const resetMarkers = () => {
    setMarkers({ source: null, destination: null });
  };

  const handleAddRoute = () => {
    setIsAddingRoute(true);
    resetMarkers();
  };

  const handleEditRoute = (routeId: string) => {
    const routeToEdit = routes.find((r) => r.id === routeId);
    if (!routeToEdit) return;

    setEditingRouteId(routeId);
    setIsAddingRoute(true);
    setNewRoute({
      user_id: routeToEdit.user_id,
      title: routeToEdit.title,
      origin: routeToEdit.origin,
      destination: routeToEdit.destination,
      category: routeToEdit.category,
      frequency: routeToEdit.frequency,
    });
    setMarkers({
      source: routeToEdit.coordinates.source,
      destination: routeToEdit.coordinates.destination
    });
  };

  const handleDeleteRoute = async (id: string) => {
    if (confirm("Are you sure you want to delete this route?")) {
      try {
        await removeRoute(id);
      } catch (error) {
        console.error("Failed to delete route:", error);
      }
    }
  };

  const handleCancelAddRoute = () => {
    setIsAddingRoute(false);
    setEditingRouteId(null);
    setNewRoute({
      user_id: user?.id || "",
      title: "",
      origin: "",
      destination: "",
      category: "",
      frequency: "",
    });
    resetMarkers();
  };

  const handleSaveRoute = async () => {
    if (
      !newRoute.title ||
      !newRoute.category ||
      !newRoute.frequency ||
      !markers.source ||
      !markers.destination
    ) {
      alert("Please fill in all required fields and set both locations.");
      return;
    }
    
    try {
      // Calculate the route and get distance in meters
      const directionsService = new google.maps.DirectionsService();
      const results = await directionsService.route({
        origin: markers.source,
        destination: markers.destination,
        travelMode: google.maps.TravelMode.DRIVING,
      });

      const distanceInMeters = results.routes[0]?.legs[0]?.distance?.value || 0;
      const distanceInKm = Math.round((distanceInMeters / 1000) * 100) / 100;

      if (editingRouteId) {
        await editRoute(editingRouteId, {
          ...newRoute,
          coordinates: { source: markers.source, destination: markers.destination },
          distance: distanceInKm,
        });
      } else {
        await addRoute({
          ...newRoute,
          coordinates: { source: markers.source, destination: markers.destination },
          distance: distanceInKm,
        });
      }

      handleCancelAddRoute();
    } catch (error) {
      console.error("Error saving route:", error);
      alert("Failed to save route. Please try again.");
    }
  };

  const filteredRoutes = routes.filter((route) => {
    const matchesSearch =
      route.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      route.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps...</div>;

  return (
    <div className="bg-background">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold">My Routes</h1>
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
              <SelectTrigger className="">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {["all", ...new Set(routes.map((r) => r.category))].map(
                  (category) => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-2">
          <Card className="h-[500px] lg:h-[600px]">
            <CardContent className="p-0 h-full">
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={defaultCenter}
                zoom={12}
                onLoad={onLoad}
                onClick={handleMapClick}
                options={{
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: false,
                }}
              >
                {/* Drag-and-drop markers when adding a route */}
                {isAddingRoute && markers.source && (
                  <Marker
                    position={markers.source}
                    draggable={true}
                    onDragEnd={async (e) => {
                      if (!e.latLng) return;
                      const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                      setMarkers(prev => ({ ...prev, source: newPos }));
                      const address = await reverseGeocode(newPos);
                      setNewRoute(prev => ({ ...prev, origin: address }));
                    }}
                    icon={{
                      url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
                      scaledSize: new google.maps.Size(30, 30),
                    }}
                  />
                )}
                {isAddingRoute && markers.destination && (
                  <Marker
                    position={markers.destination}
                    draggable={true}
                    onDragEnd={async (e) => {
                      if (!e.latLng) return;
                      const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                      setMarkers(prev => ({ ...prev, destination: newPos }));
                      const address = await reverseGeocode(newPos);
                      setNewRoute(prev => ({ ...prev, destination: address }));
                    }}
                    icon={{
                      url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                      scaledSize: new google.maps.Size(30, 30),
                    }}
                  />
                )}

                {/* Existing route markers */}
                {filteredRoutes.map((route) => (
                  <div key={route.id}>
                    <Marker
                      position={route.coordinates.source}
                      onClick={() => {
                        setSelectedRoute(route.id);
                        calculateRoute(route);
                      }}
                      icon={{
                        url: `https://maps.google.com/mapfiles/ms/icons/${
                          selectedRoute === route.id
                            ? "red-dot.png"
                            : "green-dot.png"
                        }`,
                        scaledSize: new google.maps.Size(30, 30),
                      }}
                    />
                    <Marker
                      position={route.coordinates.destination}
                      onClick={() => {
                        setSelectedRoute(route.id);
                        calculateRoute(route);
                      }}
                      icon={{
                        url: `https://maps.google.com/mapfiles/ms/icons/${
                          selectedRoute === route.id
                            ? "red-dot.png"
                            : "blue-dot.png"
                        }`,
                        scaledSize: new google.maps.Size(30, 30),
                      }}
                    />
                    {selectedRoute === route.id && directions && (
                      <DirectionsRenderer directions={directions} />
                    )}
                  </div>
                ))}
              </GoogleMap>
            </CardContent>
          </Card>
        </div>

        {/* Routes List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              My Routes ({filteredRoutes.length})
            </h2>
            <Button size="sm" onClick={handleAddRoute}>
              <Plus className="h-4 w-4 mr-2" />
              Add Route
            </Button>
          </div>

          {isAddingRoute && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingRouteId ? "Edit Route" : "Add New Route"}
                </CardTitle>
                <CardDescription>
                  {!markers.source 
                    ? "Click on the map or enter address to set origin" 
                    : !markers.destination 
                      ? "Click on the map or enter address to set destination"
                      : "Both locations set. You can drag markers to adjust."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <P>Title</P>
                <Input
                  placeholder="Route title"
                  value={newRoute.title}
                  onChange={(e) =>
                    setNewRoute({ ...newRoute, title: e.target.value })
                  }
                />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <P>Origin</P>
                    {markers.source && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setMarkers(prev => ({ ...prev, source: null }));
                          setNewRoute(prev => ({ ...prev, origin: "" }));
                        }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>
                  <Input
                    placeholder="Origin address"
                    value={newRoute.origin}
                    onChange={(e) => handleAddressChange('origin', e.target.value)}
                  />
                  {markers.source && (
                    <div className="text-xs text-muted-foreground flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {newRoute.origin || "Location set on map"}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <P>Destination</P>
                    {markers.destination && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setMarkers(prev => ({ ...prev, destination: null }));
                          setNewRoute(prev => ({ ...prev, destination: "" }));
                        }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>
                  <Input
                    placeholder="Destination address"
                    value={newRoute.destination}
                    onChange={(e) => handleAddressChange('destination', e.target.value)}
                  />
                  {markers.destination && (
                    <div className="text-xs text-muted-foreground flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {newRoute.destination || "Location set on map"}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <P>Category</P>
                  <Select
                    value={newRoute.category}
                    onValueChange={(value) =>
                      setNewRoute({ ...newRoute, category: value })
                    }
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
                  <P>Frequency</P>
                  <Select
                    value={newRoute.frequency}
                    onValueChange={(value) =>
                      setNewRoute({ ...newRoute, frequency: value })
                    }
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
                    disabled={
                      !newRoute.title ||
                      !markers.source ||
                      !markers.destination
                    }
                  >
                    Save Route
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {filteredRoutes
            .filter((route) => route.id !== editingRouteId)
            .map((route) => (
              <Card
                key={route.id}
                className={`cursor-pointer hover:shadow-md ${
                  selectedRoute === route.id ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => {
                  setSelectedRoute(route.id);
                  calculateRoute(route);
                }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{route.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <RouteIcon className="h-3 w-3" />
                        <span className="text-sm">
                          {route.origin} → {route.destination}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{route.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{route.frequency}</span>
                    <span>{route.distance}km</span>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer hover:bg-gray-200 mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditRoute(route.id);
                      }}
                    >
                      Edit
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      className="cursor-pointer hover:bg-red-700 mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRoute(route.id);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
}