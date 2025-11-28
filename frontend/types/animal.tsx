import { ErrorMessageType } from '@/types/common';
import { Pack } from '@/types/pack';

export interface DefaultAnimalImage {
    id: number;
    image_url: string;
}

export interface AnimalType {
    id: number;
    key: string;
    default_images?: DefaultAnimalImage[];
}

export type AnimalSex = 'male' | 'female' | 'unknown';

export interface Animal {
    id: number;
    name: string;
    type: AnimalType;
    pack_id: number;
    pack?: Pack;
    breed?: string | null;
    birth_date?: string | null;
    sex: AnimalSex;
    weight?: number | null;
    chip_number?: string | null;
    notes?: string | null;
    image_url?: string | null;
    default_image_id?: number | null;
    created_at: string;
    updated_at: string;
}

export interface CreateAnimalProps {
    name: string;
    animal_type_id: number;
    pack_id: number;
    breed?: string;
    birth_date?: string;
    sex?: AnimalSex;
    weight?: number;
    chip_number?: string;
    notes?: string;
    image?: File;
    default_image_id?: number;
    setErrors: React.Dispatch<React.SetStateAction<Record<string, ErrorMessageType[]>>>;
}

export interface UpdateAnimalProps {
    name: string;
    animal_type_id: number;
    breed?: string;
    birth_date?: string;
    sex?: AnimalSex;
    weight?: number;
    chip_number?: string;
    notes?: string;
    image?: File;
    default_image_id?: number;
    setErrors: React.Dispatch<React.SetStateAction<Record<string, ErrorMessageType[]>>>;
}