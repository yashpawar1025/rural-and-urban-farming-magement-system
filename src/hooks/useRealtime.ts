import { useEffect, useRef } from 'react';
import { supabase } from '@/db/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeOptions {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
  onChange?: (payload: any) => void;
}

/**
 * Custom hook for Supabase Realtime subscriptions
 * Automatically handles subscription lifecycle and cleanup
 */
export function useRealtime({
  table,
  event = '*',
  filter,
  onInsert,
  onUpdate,
  onDelete,
  onChange,
}: UseRealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    // Create unique channel name
    const channelName = `${table}-${Date.now()}`;
    
    // Create channel
    const channel = supabase.channel(channelName);

    // Build subscription config
    const config: any = {
      event,
      schema: 'public',
      table,
    };

    if (filter) {
      config.filter = filter;
    }

    // Subscribe to changes
    channel.on('postgres_changes', config, (payload) => {
      console.log(`Realtime event on ${table}:`, payload);

      // Call appropriate handler
      if (payload.eventType === 'INSERT' && onInsert) {
        onInsert(payload.new);
      } else if (payload.eventType === 'UPDATE' && onUpdate) {
        onUpdate(payload.new);
      } else if (payload.eventType === 'DELETE' && onDelete) {
        onDelete(payload.old);
      }

      // Call general change handler
      if (onChange) {
        onChange(payload);
      }
    });

    // Subscribe
    channel.subscribe((status) => {
      console.log(`Realtime subscription status for ${table}:`, status);
    });

    channelRef.current = channel;

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [table, event, filter, onInsert, onUpdate, onDelete, onChange]);

  return channelRef.current;
}

/**
 * Hook for subscribing to multiple tables
 */
export function useRealtimeMultiple(subscriptions: UseRealtimeOptions[]) {
  const channelsRef = useRef<RealtimeChannel[]>([]);

  useEffect(() => {
    const channels: RealtimeChannel[] = [];

    subscriptions.forEach((sub, index) => {
      const channelName = `${sub.table}-${index}-${Date.now()}`;
      const channel = supabase.channel(channelName);

      const config: any = {
        event: sub.event || '*',
        schema: 'public',
        table: sub.table,
      };

      if (sub.filter) {
        config.filter = sub.filter;
      }

      channel.on('postgres_changes', config, (payload) => {
        console.log(`Realtime event on ${sub.table}:`, payload);

        if (payload.eventType === 'INSERT' && sub.onInsert) {
          sub.onInsert(payload.new);
        } else if (payload.eventType === 'UPDATE' && sub.onUpdate) {
          sub.onUpdate(payload.new);
        } else if (payload.eventType === 'DELETE' && sub.onDelete) {
          sub.onDelete(payload.old);
        }

        if (sub.onChange) {
          sub.onChange(payload);
        }
      });

      channel.subscribe((status) => {
        console.log(`Realtime subscription status for ${sub.table}:`, status);
      });

      channels.push(channel);
    });

    channelsRef.current = channels;

    return () => {
      channelsRef.current.forEach((channel) => {
        supabase.removeChannel(channel);
      });
      channelsRef.current = [];
    };
  }, [subscriptions]);

  return channelsRef.current;
}
