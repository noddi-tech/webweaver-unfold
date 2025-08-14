-- Create table for managing static files
CREATE TABLE public.static_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_path TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'text/plain',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.static_files ENABLE ROW LEVEL SECURITY;

-- Create policies for static files (public read, authenticated write)
CREATE POLICY "Static files are viewable by everyone" 
ON public.static_files 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage static files" 
ON public.static_files 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_static_files_updated_at
BEFORE UPDATE ON public.static_files
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert the current llms.txt content
INSERT INTO public.static_files (file_path, content, mime_type, description) VALUES 
('llms.txt', '# Noddi

> Noddi is a comprehensive business website and CMS platform built with React, TypeScript, and Supabase. It provides a complete content management system for businesses to manage their online presence.

## Key Features

- **Dynamic Content Management**: Full CMS for managing pages, sections, and content
- **Design System**: Comprehensive design tokens and component library
- **Team Management**: Employee profiles and team organization
- **Contact Management**: Contact forms with Slack integration
- **SEO Optimized**: Built-in SEO best practices and meta management
- **Responsive Design**: Mobile-first responsive design system
- **Authentication**: Secure admin authentication system

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **UI Components**: Radix UI, shadcn/ui
- **Routing**: React Router
- **State Management**: React Query
- **Build Tool**: Vite
- **Deployment**: Lovable platform

## Main Pages

- `/`: Homepage with hero, features, metrics, and CTA sections
- `/team`: Team member profiles and contact information  
- `/contact`: Contact form with Slack integration
- `/features`: Detailed feature showcase
- `/demo`: Product demonstration
- `/cms-login`: Admin authentication portal
- `/admin`: Content management system interface

## CMS Features

The admin panel provides comprehensive content management including:
- Page settings and metadata
- Section content and styling
- Team member management
- Brand settings and logo configuration
- Design token customization
- Typography and spacing controls
- Contact and employee management

## API Integration

- Supabase Edge Functions for contact form processing
- Slack webhook integration for contact notifications
- Real-time content updates
- Secure file upload and storage

## Content Structure

All content is dynamically loaded from Supabase database including:
- Page metadata and SEO settings
- Section content with rich text support
- Team member profiles and contact details
- Brand assets and design tokens
- Navigation links and site structure

This platform enables businesses to maintain a professional web presence with full control over content, design, and functionality through an intuitive admin interface.', 'text/plain', 'LLM-friendly description of the website and platform');