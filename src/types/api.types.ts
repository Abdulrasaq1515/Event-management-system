// API Response Types
export type ApiResponse<T = unknown> =
  | {
      success: true;
      data: T;
      message?: string;
    }
  | {
      success: false;
      error: string;
      code: string;
      details?: unknown;
    };

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// API Request Types
export interface CreateEventRequest {
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  timezone: string;
  location:
    | import('./event.types').PhysicalLocation
    | import('./event.types').VirtualLocation;
  capacity?: number;
  visibility: import('./event.types').EventVisibility;
  price?: import('./event.types').EventPrice;
  images: import('./event.types').EventImages;
  categoryId?: string;
  nftMetadata?: Partial<import('./event.types').NFTMetadata>;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  status?: import('./event.types').EventStatus;
}

export interface EventListRequest {
  page?: string;
  limit?: string;
  status?: string;
  category?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

// Component Props Types
export interface EventRouteContext {
  params: { id: string };
}

export interface EventsPageProps {
  searchParams: import('./event.types').EventQueryParams;
}

export interface EventDetailPageProps {
  params: { id: string };
}

export interface EventFormPageProps {
  params: { id?: string };
}
