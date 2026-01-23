export interface MenuItem {
  id: string;
  name: string;
  originalPrice: number;
}

export interface MenuTableItem extends MenuItem {
  markupPrice: number;
}

export interface ExtractionResult {
  items: MenuItem[];
}

export enum ProcessingStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
