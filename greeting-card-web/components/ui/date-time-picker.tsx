'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDownIcon } from 'lucide-react';

interface DateTimePickerProps {
  label?: string;
  value: Date | null;
  onChange: (val: Date | null) => void;
}

export function DateTimePicker({ label, value, onChange }: DateTimePickerProps) {
  const [open, setOpen] = useState(false);

  // derive time string (HH:mm:ss)
  const timeString = value ? value.toLocaleTimeString('en-GB', { hour12: false }) : '00:00:00';

  return (
    <div className="flex flex-col gap-3">
      {label && (
        <Label htmlFor="date-time-picker" className="px-1">
          {label}
        </Label>
      )}

      <div className="flex gap-4">
        {/* DATE */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date-time-picker"
              className="w-[160px] justify-between font-normal"
            >
              {value ? value.toLocaleDateString() : 'Pick a date'}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={value ?? undefined}
              onSelect={selected => {
                if (!selected) {
                  onChange(null);
                } else {
                  const updated = value
                    ? new Date(
                        selected.getFullYear(),
                        selected.getMonth(),
                        selected.getDate(),
                        value.getHours(),
                        value.getMinutes(),
                        value.getSeconds(),
                      )
                    : selected;
                  onChange(updated);
                }
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>

        {/* TIME */}
        <Input
          type="time"
          step={1} // seconds
          value={timeString}
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
          onChange={e => {
            const [h, m, s] = e.target.value.split(':').map(Number);

            if (!value) {
              // if no date selected, initialize with today
              const now = new Date();
              const updated = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, s);
              onChange(updated);
              return;
            }

            const updated = new Date(
              value.getFullYear(),
              value.getMonth(),
              value.getDate(),
              h,
              m,
              s,
            );
            onChange(updated);
          }}
        />
      </div>
    </div>
  );
}

export default DateTimePicker;
