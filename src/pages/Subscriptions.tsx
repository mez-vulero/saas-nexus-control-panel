
import { subscriptions } from "@/mock/mockData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, Filter, CheckCheck, X } from "lucide-react";
import { useState } from "react";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString();
};

const Subscriptions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    product: "",
    plan: "",
    status: "",
    interval: "",
  });

  // Get unique values for filters
  const products = Array.from(new Set(subscriptions.map(sub => sub.productName)));
  const plans = Array.from(new Set(subscriptions.map(sub => sub.plan)));
  const statuses = Array.from(new Set(subscriptions.map(sub => sub.status)));
  const intervals = Array.from(new Set(subscriptions.map(sub => sub.interval)));

  const filteredSubscriptions = subscriptions.filter(
    (sub) => {
      // Search filter
      const matchesSearch =
        sub.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.productName.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Product filter
      const matchesProduct = !filters.product || 
        sub.productName === filters.product;
      
      // Plan filter
      const matchesPlan = !filters.plan || 
        sub.plan === filters.plan;
      
      // Status filter
      const matchesStatus = !filters.status || 
        sub.status === filters.status;
      
      // Interval filter
      const matchesInterval = !filters.interval || 
        sub.interval === filters.interval;

      return matchesSearch && matchesProduct && matchesPlan && matchesStatus && matchesInterval;
    }
  );

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      product: "",
      plan: "",
      status: "",
      interval: "",
    });
  };

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      case "trial":
        return "bg-blue-500";
      case "past_due":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "free":
        return "bg-gray-500";
      case "starter":
        return "bg-blue-500";
      case "professional":
        return "bg-purple-500";
      case "enterprise":
        return "bg-primary";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subscriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <Badge className="ml-1 bg-primary h-5 w-5 p-0 flex items-center justify-center rounded-full">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80">
              <DropdownMenuLabel>Filter Subscriptions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup className="p-2 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="filter-product" className="text-xs">Product</Label>
                  <Select
                    value={filters.product}
                    onValueChange={(value) => setFilters({ ...filters, product: value })}
                  >
                    <SelectTrigger id="filter-product">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All products</SelectItem>
                      {products.map((product) => (
                        <SelectItem key={product} value={product}>
                          {product}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filter-plan" className="text-xs">Plan</Label>
                  <Select
                    value={filters.plan}
                    onValueChange={(value) => setFilters({ ...filters, plan: value })}
                  >
                    <SelectTrigger id="filter-plan">
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All plans</SelectItem>
                      {plans.map((plan) => (
                        <SelectItem key={plan} value={plan}>
                          {plan}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filter-status" className="text-xs">Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters({ ...filters, status: value })}
                  >
                    <SelectTrigger id="filter-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filter-interval" className="text-xs">Billing Interval</Label>
                  <Select
                    value={filters.interval}
                    onValueChange={(value) => setFilters({ ...filters, interval: value })}
                  >
                    <SelectTrigger id="filter-interval">
                      <SelectValue placeholder="Select interval" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All intervals</SelectItem>
                      {intervals.map((interval) => (
                        <SelectItem key={interval} value={interval}>
                          {interval}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    onClick={resetFilters}
                    className="w-full"
                    disabled={!activeFilterCount}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reset Filters
                  </Button>
                </div>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Filter chips/tags display */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {filters.product && (
              <Badge variant="outline" className="flex items-center gap-1 px-2 py-1">
                <CheckCheck className="h-3 w-3" />
                Product: {filters.product}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => setFilters({ ...filters, product: "" })}
                />
              </Badge>
            )}
            {filters.plan && (
              <Badge variant="outline" className="flex items-center gap-1 px-2 py-1">
                <CheckCheck className="h-3 w-3" />
                Plan: {filters.plan}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => setFilters({ ...filters, plan: "" })}
                />
              </Badge>
            )}
            {filters.status && (
              <Badge variant="outline" className="flex items-center gap-1 px-2 py-1">
                <CheckCheck className="h-3 w-3" />
                Status: {filters.status}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => setFilters({ ...filters, status: "" })}
                />
              </Badge>
            )}
            {filters.interval && (
              <Badge variant="outline" className="flex items-center gap-1 px-2 py-1">
                <CheckCheck className="h-3 w-3" />
                Interval: {filters.interval}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => setFilters({ ...filters, interval: "" })}
                />
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                  No subscriptions found
                </TableCell>
              </TableRow>
            ) : (
              filteredSubscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{sub.userName}</div>
                      <div className="text-xs text-muted-foreground">{sub.userEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>{sub.productName}</TableCell>
                  <TableCell>
                    <Badge className={getPlanColor(sub.plan)}>
                      {sub.plan} {sub.interval === "annual" ? "(annual)" : ""}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(sub.status)}>
                      {sub.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(sub.amount)}</TableCell>
                  <TableCell>{formatDate(sub.startDate)}</TableCell>
                  <TableCell>{formatDate(sub.endDate)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline">
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Subscriptions;
