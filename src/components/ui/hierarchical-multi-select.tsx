
import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';

interface HierarchicalMultiSelectProps {
  options: Record<string, string>;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  getHierarchicalLabel?: (key: string, options: Record<string, any>) => string;
  showHierarchicalLabels?: boolean;
}

export const HierarchicalMultiSelect: React.FC<HierarchicalMultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  disabled = false,
  className,
  getHierarchicalLabel,
  showHierarchicalLabels = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (optionKey: string, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    const newValue = value.includes(optionKey)
      ? value.filter(v => v !== optionKey)
      : [...value, optionKey];
    onChange(newValue);
    
    // Don't close dropdown to allow multi-selection
  };

  const handleRemove = (optionKey: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onChange(value.filter(v => v !== optionKey));
  };

  const getDisplayLabel = (key: string) => {
    if (showHierarchicalLabels && getHierarchicalLabel) {
      return getHierarchicalLabel(key, options);
    }
    return options[key] || key;
  };

  // Filter options based on search term
  const filteredOptions = Object.entries(options).filter(([key, label]) => {
    const searchLower = searchTerm.toLowerCase();
    
    // Get the label to search - either hierarchical or regular
    let labelToSearch: string;
    if (showHierarchicalLabels && getHierarchicalLabel) {
      labelToSearch = getHierarchicalLabel(key, options);
    } else {
      labelToSearch = typeof label === 'string' ? label : String(label);
    }
    
    return labelToSearch.toLowerCase().includes(searchLower);
  });

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-between min-h-10 h-auto text-left font-normal",
            "hover:bg-gray-50 focus:ring-2 focus:ring-primary focus:ring-offset-1",
            "border-gray-300 hover:border-gray-400",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
        >
          <div className="flex flex-wrap gap-1 flex-1 items-center">
            {value.length === 0 ? (
              <span className="text-gray-500">{placeholder}</span>
            ) : value.length <= 3 ? (
              <div className="flex flex-wrap gap-1">
                {value.map(optionKey => (
                  <Badge
                    key={optionKey}
                    variant="secondary"
                    className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 px-2 py-1"
                  >
                    {getDisplayLabel(optionKey)}
                    <button
                      onClick={(e) => handleRemove(optionKey, e)}
                      className="ml-1 hover:bg-blue-300 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-gray-900 font-medium">{value.length} options selected</span>
            )}
          </div>
          <ChevronDown className={cn(
            "h-4 w-4 text-gray-500 transition-transform duration-200",
            isOpen && "transform rotate-180"
          )} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-full min-w-[var(--radix-dropdown-menu-trigger-width)] bg-white border border-gray-200 shadow-lg rounded-md p-1 z-50" 
        align="start"
        sideOffset={4}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="p-2 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              ref={searchInputRef}
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 text-sm"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
        <div className="max-h-60 overflow-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">No options found</div>
          ) : (
            filteredOptions.map(([key, label]) => (
              <DropdownMenuCheckboxItem
                key={key}
                checked={value.includes(key)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onChange([...value, key]);
                  } else {
                    onChange(value.filter(v => v !== key));
                  }
                }}
                onSelect={(e) => e.preventDefault()}
                className={cn(
                  "cursor-pointer px-3 py-2 hover:bg-gray-100 focus:bg-gray-100",
                  "transition-colors duration-150 rounded-sm",
                  value.includes(key) && "bg-blue-50"
                )}
              >
                <div className="flex items-center space-x-3 w-full">
                  <div className={cn(
                    "flex h-4 w-4 items-center justify-center rounded border-2 transition-colors",
                    value.includes(key) 
                      ? "bg-primary border-primary text-white" 
                      : "border-gray-300 hover:border-gray-400"
                  )}>
                    {value.includes(key) && <Check className="h-3 w-3" />}
                  </div>
                  <span className="text-sm text-gray-900 flex-1">{getDisplayLabel(key)}</span>
                </div>
              </DropdownMenuCheckboxItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
