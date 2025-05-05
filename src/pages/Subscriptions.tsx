
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
import { Search } from "lucide-react";
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

  const filteredSubscriptions = subscriptions.filter(
    (sub) =>
      sub.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
