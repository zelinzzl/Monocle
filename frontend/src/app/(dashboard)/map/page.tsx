"use client";

import { useState, useCallback } from "react";
import {
  Search,
  Filter,
  Plus,
  Clock,
  Route as RouteIcon,
  MapPin,
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
import { geocodeAddress, Route } from "@/services/routeService";
import { useAuth } from "@/context/auth-context";

const containerStyle = { width: "100%", height: "100%", minHeight: "500px" };
const defaultCenter = { lat: -26.2041, lng: 28.0473 };

export default function MapPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [isAddingRoute, setIsAddingRoute] = useState(false);
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [originalRoute, setOriginalRoute] = useState<Omit<
    Route,
    "coordinates"
  > | null>(null);

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
    libraries: ["places"],
  });

  const { routes, addRoute, removeRoute, editRoute, loading } = useRoutes(
    user?.id || ""
  );
  const { directions, distance, calculateRoute } = useDirections(isLoaded);

  const handleAddRoute = () => setIsAddingRoute(true);
  const handleEditRoute = (routeId: string) => {
    const routeToEdit = routes.find((r) => r.id === routeId);
    if (!routeToEdit) return;

    setEditingRouteId(routeId); // ✅ track which route is being edited
    setIsAddingRoute(true); // ✅ opens the same card
    setNewRoute({
      user_id: routeToEdit.user_id,
      title: routeToEdit.title,
      origin: routeToEdit.origin,
      destination: routeToEdit.destination,
      category: routeToEdit.category,
      frequency: routeToEdit.frequency,
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
  };

  const handleSaveRoute = async () => {
    if (!newRoute.title || !newRoute.origin || !newRoute.destination) {
      alert("Please fill in all required fields");
      return;
    }
  
    try {
      // Geocode both addresses first
      const [sourceCoords, destCoords] = await Promise.all([
        geocodeAddress(newRoute.origin),
        geocodeAddress(newRoute.destination),
      ]);
  
      // Calculate the route and get distance in meters (numeric value)
      const directionsService = new google.maps.DirectionsService();
      const results = await directionsService.route({
        origin: sourceCoords,
        destination: destCoords,
        travelMode: google.maps.TravelMode.DRIVING,
      });
  
      // Get the raw distance value in meters (always numeric)
      const distanceInMeters = results.routes[0]?.legs[0]?.distance?.value || 0;
      
      // Convert to kilometers and round to 2 decimal places
      const distanceInKm = Math.round((distanceInMeters / 1000) * 100) / 100;
  
      if (editingRouteId) {
        await editRoute(editingRouteId, {
          ...newRoute,
          coordinates: { source: sourceCoords, destination: destCoords },
          distance: distanceInKm, // Numeric value in kilometers
        });
      } else {
        await addRoute({
          ...newRoute,
          coordinates: { source: sourceCoords, destination: destCoords },
          distance: distanceInKm, // Numeric value in kilometers
        });
      }
  
      // Reset form
      handleCancelAddRoute();
      setEditingRouteId(null);
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
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-40">
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
                options={{
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: false,
                }}>
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
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Route title"
                  value={newRoute.title}
                  onChange={(e) =>
                    setNewRoute({ ...newRoute, title: e.target.value })
                  }
                />
                <Input
                  placeholder="Origin address"
                  value={newRoute.origin}
                  onChange={(e) =>
                    setNewRoute({ ...newRoute, origin: e.target.value })
                  }
                />
                <Input
                  placeholder="Destination address"
                  value={newRoute.destination}
                  onChange={(e) =>
                    setNewRoute({ ...newRoute, destination: e.target.value })
                  }
                />
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    value={newRoute.category}
                    onValueChange={(value) =>
                      setNewRoute({ ...newRoute, category: value })
                    }>
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
                    onValueChange={(value) =>
                      setNewRoute({ ...newRoute, frequency: value })
                    }>
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
                    onClick={handleCancelAddRoute}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSaveRoute}
                    disabled={
                      !newRoute.title ||
                      !newRoute.origin ||
                      !newRoute.destination
                    }>
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
                }}>
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
                    onClick={() => handleEditRoute(route.id)}>
                    Edit
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    className="cursor-pointer hover:bg-red-700 mt-2"
                    onClick={() => handleDeleteRoute(route.id)}>
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
