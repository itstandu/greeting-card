'use client';

import { useId, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CheckIcon, ChevronsUpDownIcon, XIcon } from 'lucide-react';

interface Item {
  value: string;
  label: string;
}

interface MultiSelectExpandableProps {
  label?: string;
  items: Item[];
  value: string[];
  onChange: (newValues: string[]) => void;
  maxShownItems?: number;
}

export function MultiSelectExpandable({
  label,
  items,
  value,
  onChange,
  maxShownItems = 2,
}: MultiSelectExpandableProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const toggleSelection = (v: string) => {
    if (value.includes(v)) {
      onChange(value.filter(item => item !== v));
    } else {
      onChange([...value, v]);
    }
  };

  const removeSelection = (v: string) => {
    onChange(value.filter(item => item !== v));
  };

  const visibleItems = expanded ? value : value.slice(0, maxShownItems);
  const hiddenCount = value.length - visibleItems.length;

  return (
    <div className="w-full max-w-xs space-y-2">
      {label && <Label htmlFor={id}>{label}</Label>}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-auto min-h-8 w-full justify-between hover:bg-transparent"
          >
            <div className="flex flex-wrap items-center gap-1 pr-2.5">
              {value.length > 0 ? (
                <>
                  {visibleItems.map(val => {
                    const item = items.find(i => i.value === val);
                    if (!item) return null;

                    return (
                      <Badge
                        key={val}
                        variant="outline"
                        className="flex items-center gap-1 rounded-sm"
                      >
                        {item.label}
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            removeSelection(val);
                          }}
                          className="flex items-center justify-center"
                        >
                          <XIcon className="size-3" />
                        </button>
                      </Badge>
                    );
                  })}

                  {hiddenCount > 0 || expanded ? (
                    <Badge
                      variant="outline"
                      onClick={e => {
                        e.stopPropagation();
                        setExpanded(prev => !prev);
                      }}
                      className="cursor-pointer rounded-sm"
                    >
                      {expanded ? 'Show Less' : `+${hiddenCount} more`}
                    </Badge>
                  ) : null}
                </>
              ) : (
                <span className="text-muted-foreground">Select...</span>
              )}
            </div>

            <ChevronsUpDownIcon className="text-muted-foreground/80 shrink-0" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-(--radix-popper-anchor-width) p-0">
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandList>
              <CommandEmpty>No results.</CommandEmpty>

              <CommandGroup>
                {items.map(item => (
                  <CommandItem
                    key={item.value}
                    value={item.value}
                    onSelect={() => toggleSelection(item.value)}
                  >
                    <span className="truncate">{item.label}</span>
                    {value.includes(item.value) && <CheckIcon size={16} className="ml-auto" />}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default MultiSelectExpandable;
