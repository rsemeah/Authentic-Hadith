export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'remote' | 'hybrid' | 'onsite';
  tags: string[];
  description: string;
  stipend: string;
  postedAt: string;
  experience: string;
  applyUrl: string;
}
