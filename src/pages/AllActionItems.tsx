import { useState, useMemo } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Calendar, Filter, SortAsc, SortDesc, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ActionItem } from "@/components/dashboard/ActionItemsSection";
import { EditActionItemDialog } from "@/components/dashboard/EditActionItemDialog";

type SortField = "created_at" | "due_date" | "priority" | "status" | "assignee";
type SortOrder = "asc" | "desc";

interface PillarConfig {
  name: string;
  color: string;
  label: string;
}

const pillarConfigs: Record<string, PillarConfig> = {
  safety: { name: "safety", color: "bg-red-500", label: "Safety" },
  quality: { name: "quality", color: "bg-blue-500", label: "Quality" },
  cost: { name: "cost", color: "bg-green-500", label: "Cost" },
  delivery: { name: "delivery", color: "bg-purple-500", label: "Delivery" },
  inventory: { name: "inventory", color: "bg-orange-500", label: "Inventory" },
  production: { name: "production", color: "bg-indigo-500", label: "Production" }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High': return 'border-status-issue text-status-issue bg-status-issue/5';
    case 'Medium': return 'border-status-caution text-status-caution bg-status-caution/5';
    case 'Low': return 'border-status-good text-status-good bg-status-good/5';
    default: return 'border-border text-muted-foreground';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed': return 'bg-status-good border-status-good text-white';
    case 'In Progress': return 'border-status-caution text-status-caution bg-status-caution/5';
    case 'Open': return 'border-status-issue text-status-issue bg-status-issue/5';
    default: return 'border-border text-muted-foreground';
  }
};

const getPriorityValue = (priority: string) => {
  switch (priority) {
    case 'High': return 3;
    case 'Medium': return 2;
    case 'Low': return 1;
    default: return 0;
  }
};

const ActionItemCard = ({ 
  item, 
  onClick, 
  onMarkCompleted,
  isUpdating = false
}: { 
  item: ActionItem; 
  onClick: () => void; 
  onMarkCompleted: (item: ActionItem) => void;
  isUpdating?: boolean;
}) => {
  const isOverdue = item.due_date && new Date(item.due_date) < new Date();
  const isCompleted = item.status === 'Completed';

  const handleMarkCompleted = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening edit dialog
    if (!isUpdating) {
      onMarkCompleted(item);
    }
  };

  return (
    <div 
      className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:bg-muted/30 relative"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm font-medium flex-1 mr-3">{item.description}</p>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isOverdue && !isCompleted && (
            <AlertTriangle className="w-4 h-4 text-status-issue" />
          )}
          {!isCompleted && (
            <Button
              size="sm"
              variant="outline"
              className="h-6 w-6 p-0 border-status-good text-status-good hover:bg-status-good hover:text-white disabled:opacity-50"
              onClick={handleMarkCompleted}
              disabled={isUpdating}
              title="Mark as Completed"
            >
              <Check className={`w-3 h-3 ${isUpdating ? 'animate-pulse' : ''}`} />
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 text-xs">
        <Badge className={`${getPriorityColor(item.priority)} text-xs`}>
          {item.priority}
        </Badge>
        <Badge className={`${getStatusColor(item.status)} text-xs`}>
          {item.status}
        </Badge>
        {item.assignee && (
          <Badge variant="outline" className="text-xs">
            {item.assignee}
          </Badge>
        )}
        {item.due_date && (
          <Badge variant="outline" className={`text-xs ${isOverdue ? 'border-status-issue text-status-issue' : ''}`}>
            Due: {new Date(item.due_date).toLocaleDateString()}
          </Badge>
        )}
        <Badge variant="outline" className="text-xs text-muted-foreground">
          Created: {new Date(item.created_at).toLocaleDateString()}
        </Badge>
      </div>
    </div>
  );
};

export const AllActionItems = () => {
  const [sortField, setSortField] = useState<SortField>("due_date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [statusFilter, setStatusFilter] = useState<string>("Open");
  const [editingItem, setEditingItem] = useState<ActionItem | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  
  const queryClient = useQueryClient();

  const { data: actionItems = [], isLoading } = useQuery({
    queryKey: ['all-action-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('action_items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ActionItem[];
    }
  });

  const updateActionItemMutation = useMutation({
    mutationFn: async (updatedItem: ActionItem) => {
      const { data, error } = await supabase
        .from('action_items')
        .update({
          description: updatedItem.description,
          assignee: updatedItem.assignee,
          priority: updatedItem.priority,
          status: updatedItem.status,
          due_date: updatedItem.due_date,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedItem.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-action-items'] });
      setIsDialogOpen(false);
      setEditingItem(undefined);
    }
  });

  const markCompletedMutation = useMutation({
    mutationFn: async (itemId: string) => {
      // Add item to updating set
      setUpdatingItems(prev => new Set(prev).add(itemId));
      
      const { data, error } = await supabase
        .from('action_items')
        .update({
          status: 'Completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['all-action-items'] });
      // Remove item from updating set
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.id);
        return newSet;
      });
    },
    onError: (error, itemId) => {
      // Remove item from updating set on error
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  });

  const handleEditItem = (item: ActionItem) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleSave = (updatedItem: ActionItem) => {
    updateActionItemMutation.mutate(updatedItem);
  };

  const handleMarkCompleted = (item: ActionItem) => {
    markCompletedMutation.mutate(item.id);
  };

  const filteredAndSortedItems = useMemo(() => {
    let filtered = actionItems;

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Group by pillar
    const groupedByPillar = filtered.reduce((acc, item) => {
      if (!acc[item.pillar]) {
        acc[item.pillar] = [];
      }
      acc[item.pillar].push(item);
      return acc;
    }, {} as Record<string, ActionItem[]>);

    // Sort items within each pillar
    Object.keys(groupedByPillar).forEach(pillar => {
      groupedByPillar[pillar].sort((a, b) => {
        let aValue: string | number = a[sortField];
        let bValue: string | number = b[sortField];

        // Handle priority sorting
        if (sortField === 'priority') {
          aValue = getPriorityValue(a.priority);
          bValue = getPriorityValue(b.priority);
        }

        // Handle date sorting
        if (sortField === 'due_date' || sortField === 'created_at') {
          aValue = aValue ? new Date(aValue).getTime() : 0;
          bValue = bValue ? new Date(bValue).getTime() : 0;
        }

        // Handle string sorting
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    });

    return groupedByPillar;
  }, [actionItems, sortField, sortOrder, statusFilter]);

  const totalItems = actionItems.length;
  const filteredTotal = Object.values(filteredAndSortedItems).reduce((sum, items) => sum + items.length, 0);

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center">Loading action items...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">All Action Items</h1>
        <p className="text-muted-foreground">
          Showing {filteredTotal} of {totalItems} action items across all pillars
        </p>
      </div>

      {/* Controls */}
      <Card className="p-6 mb-8">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filters & Sorting:</span>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Date Created</SelectItem>
              <SelectItem value="due_date">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="assignee">Assignee</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-2"
          >
            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          </Button>
        </div>
      </Card>

      {/* Pillar Cards */}
      <div className="space-y-6">
        {Object.entries(pillarConfigs).map(([pillarKey, config]) => {
          const pillarItems = filteredAndSortedItems[pillarKey] || [];
          
          return (
            <Card key={pillarKey} className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-4 h-4 rounded-full ${config.color}`} />
                  <h2 className="text-xl font-semibold">{config.label}</h2>
                  <Badge variant="outline" className="ml-auto">
                    {pillarItems.length} item{pillarItems.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                
                {pillarItems.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {pillarItems.map((item) => (
                      <ActionItemCard 
                        key={item.id} 
                        item={item} 
                        onClick={() => handleEditItem(item)}
                        onMarkCompleted={handleMarkCompleted}
                        isUpdating={updatingItems.has(item.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No action items found for {config.label}</p>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <EditActionItemDialog
        actionItem={editingItem}
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingItem(undefined);
        }}
        onSave={handleSave}
      />
    </div>
  );
};