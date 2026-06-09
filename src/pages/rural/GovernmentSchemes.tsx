import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/common/GlassCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { getGovernmentSchemes } from '@/db/api';
import type { GovernmentScheme } from '@/types/types';
import { Search, ExternalLink } from 'lucide-react';

export default function GovernmentSchemes() {
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [filteredSchemes, setFilteredSchemes] = useState<GovernmentScheme[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    getGovernmentSchemes().then((data) => {
      setSchemes(data);
      setFilteredSchemes(data);
    });
  }, []);

  useEffect(() => {
    let filtered = schemes;
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.scheme_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (typeFilter !== 'all') {
      filtered = filtered.filter(s => s.scheme_type === typeFilter);
    }
    setFilteredSchemes(filtered);
  }, [searchTerm, typeFilter, schemes]);

  const schemeTypes = Array.from(new Set(schemes.map(s => s.scheme_type)));

  return (
    <div className="p-6 space-y-6">
      <div className="gradient-animate rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Government Schemes</h1>
        <p className="text-white/90">Explore subsidies, insurance, and loan programs</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search schemes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {schemeTypes.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSchemes.map((scheme) => (
          <GlassCard key={scheme.id}>
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-lg">{scheme.scheme_name}</h3>
                <Badge variant="outline">{scheme.scheme_type}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{scheme.description}</p>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Eligibility:</span> {scheme.eligibility}</p>
                {scheme.application_deadline && (
                  <p><span className="font-medium">Deadline:</span> {scheme.application_deadline}</p>
                )}
              </div>
              {scheme.link && (
                <a
                  href={scheme.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  Learn More <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </GlassCard>
        ))}
      </div>

      {filteredSchemes.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No schemes found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
