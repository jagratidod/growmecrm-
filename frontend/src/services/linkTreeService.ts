import { request } from './api';

export type BioLinkIcon = 'whatsapp' | 'package' | 'web' | 'review';

export interface BioLinkItem {
  id: string;
  title: string;
  url: string;
  icon: BioLinkIcon;
  active: boolean;
}

export interface LinkTreeData {
  id: string;
  bioTitle: string;
  bioTagline: string;
  links: BioLinkItem[];
  updatedAt?: string;
}

export const linkTreeService = {
  async getLinkTree(): Promise<LinkTreeData> {
    return request<LinkTreeData>('/linktree');
  },

  async updateLinkTree(data: {
    bioTitle?: string;
    bioTagline?: string;
    links?: BioLinkItem[];
  }): Promise<LinkTreeData> {
    return request<LinkTreeData>('/linktree', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async addLink(data: {
    title: string;
    url: string;
    icon?: BioLinkIcon;
    active?: boolean;
  }): Promise<{ newLink: BioLinkItem; linkTree: LinkTreeData }> {
    return request<{ newLink: BioLinkItem; linkTree: LinkTreeData }>('/linktree/links', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteLink(linkId: string): Promise<LinkTreeData> {
    return request<LinkTreeData>(`/linktree/links/${linkId}`, {
      method: 'DELETE',
    });
  },

  async toggleLink(linkId: string): Promise<LinkTreeData> {
    return request<LinkTreeData>(`/linktree/links/${linkId}/toggle`, {
      method: 'PATCH',
    });
  },

  async getPublicBio(slug: string): Promise<any> {
    return request<any>(`/linktree/public/${slug}`);
  },
};
