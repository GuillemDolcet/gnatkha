import { useState, useRef, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { IconPhoto, IconCheck } from "@tabler/icons-react";
import { Animal, AnimalSex } from "@/types/animal";
import { ErrorMessageType } from "@/types/common";
import { useAnimalTypes } from "@/hooks/animalTypes";

interface ActionResult {
    success: boolean;
    error?: 'forbidden' | 'not_found' | 'unknown';
}

interface EditAnimalModalProps {
    animal: Animal;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: (animalId: number, data: {
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
    }) => Promise<ActionResult>;
}

export default function EditAnimalModal({
                                            animal,
                                            open,
                                            onOpenChange,
                                            onUpdate,
                                        }: EditAnimalModalProps) {
    const t = useTranslations('animals.edit');
    const tCreate = useTranslations('animals.create');
    const tSex = useTranslations('animals.sex');
    const tTypes = useTranslations('animals.types');
    const tToast = useTranslations('animals.toast');
    const { animalTypes } = useAnimalTypes();

    const [name, setName] = useState(animal.name);
    const [animalTypeId, setAnimalTypeId] = useState(animal.type.id.toString());
    const [breed, setBreed] = useState(animal.breed || '');
    const [birthDate, setBirthDate] = useState(animal.birth_date || '');
    const [sex, setSex] = useState<string>(animal.sex || 'unknown');
    const [weight, setWeight] = useState(animal.weight?.toString() || '');
    const [chipNumber, setChipNumber] = useState(animal.chip_number || '');
    const [notes, setNotes] = useState(animal.notes || '');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(animal.image_url || null);
    const [selectedDefaultImageId, setSelectedDefaultImageId] = useState<number | null>(animal.default_image_id || null);
    const [errors, setErrors] = useState<Record<string, ErrorMessageType[]>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const selectedType = useMemo(() => {
        return animalTypes.find(t => t.id.toString() === animalTypeId);
    }, [animalTypes, animalTypeId]);

    const defaultImages = selectedType?.default_images ?? [];

    useEffect(() => {
        if (open) {
            setName(animal.name);
            setAnimalTypeId(animal.type.id.toString());
            setBreed(animal.breed || '');
            setBirthDate(animal.birth_date || '');
            setSex(animal.sex || 'unknown');
            setWeight(animal.weight?.toString() || '');
            setChipNumber(animal.chip_number || '');
            setNotes(animal.notes || '');
            setImage(null);
            setImagePreview(animal.image_url || null);
            setSelectedDefaultImageId(animal.default_image_id || null);
            setErrors({});
        }
    }, [open, animal]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setSelectedDefaultImageId(null);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSelectDefaultImage = (imageId: number, imageUrl: string) => {
        setSelectedDefaultImageId(imageId);
        setImage(null);
        setImagePreview(imageUrl);
    };

    const handleTypeChange = (value: string) => {
        setAnimalTypeId(value);
        setSelectedDefaultImageId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !animalTypeId) return;

        setIsSubmitting(true);
        const result = await onUpdate(animal.id, {
            name: name.trim(),
            animal_type_id: parseInt(animalTypeId),
            breed: breed.trim() || undefined,
            birth_date: birthDate || undefined,
            sex: sex as AnimalSex,
            weight: weight ? parseFloat(weight) : undefined,
            chip_number: chipNumber.trim() || undefined,
            notes: notes.trim() || undefined,
            image: image || undefined,
            default_image_id: selectedDefaultImageId || undefined,
            setErrors,
        });
        setIsSubmitting(false);

        if (result.success) {
            toast.success(tToast('animal_updated'));
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{t('title')}</DialogTitle>
                        <DialogDescription>
                            {t('description')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <div className="w-full">
                            <Label htmlFor="edit-animal-name">{tCreate('name_label')}</Label>
                            <Input
                                id="edit-animal-name"
                                type="text"
                                name="name"
                                value={name}
                                set={setName}
                                setErrors={setErrors}
                                errors={errors?.name}
                                placeholder={tCreate('name_placeholder')}
                                className="mt-1 w-full"
                            />
                        </div>

                        <div className="w-full">
                            <Label htmlFor="edit-animal-type">{tCreate('type_label')}</Label>
                            <Select value={animalTypeId} onValueChange={handleTypeChange}>
                                <SelectTrigger className="mt-1 w-full cursor-pointer">
                                    <SelectValue placeholder={tCreate('type_placeholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {animalTypes.map(type => (
                                        <SelectItem
                                            key={type.id}
                                            value={type.id.toString()}
                                            className="cursor-pointer"
                                        >
                                            {tTypes(type.key)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-full">
                            <Label htmlFor="edit-animal-breed">{tCreate('breed_label')}</Label>
                            <Input
                                id="edit-animal-breed"
                                type="text"
                                name="breed"
                                value={breed}
                                set={setBreed}
                                setErrors={setErrors}
                                errors={errors?.breed}
                                placeholder={tCreate('breed_placeholder')}
                                className="mt-1 w-full"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="w-full">
                                <Label htmlFor="edit-animal-birth-date">{tCreate('birth_date_label')}</Label>
                                <Input
                                    id="edit-animal-birth-date"
                                    type="date"
                                    name="birth_date"
                                    value={birthDate}
                                    set={setBirthDate}
                                    setErrors={setErrors}
                                    errors={errors?.birth_date}
                                    className="mt-1 w-full"
                                    max={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            <div className="w-full">
                                <Label htmlFor="edit-animal-sex">{tCreate('sex_label')}</Label>
                                <Select value={sex} onValueChange={setSex}>
                                    <SelectTrigger className="mt-1 w-full cursor-pointer">
                                        <SelectValue placeholder={tCreate('sex_placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male" className="cursor-pointer">{tSex('male')}</SelectItem>
                                        <SelectItem value="female" className="cursor-pointer">{tSex('female')}</SelectItem>
                                        <SelectItem value="unknown" className="cursor-pointer">{tSex('unknown')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="w-full">
                                <Label htmlFor="edit-animal-weight">{tCreate('weight_label')}</Label>
                                <Input
                                    id="edit-animal-weight"
                                    type="number"
                                    name="weight"
                                    value={weight}
                                    set={setWeight}
                                    setErrors={setErrors}
                                    errors={errors?.weight}
                                    placeholder={tCreate('weight_placeholder')}
                                    className="mt-1 w-full"
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            <div className="w-full">
                                <Label htmlFor="edit-animal-chip">{tCreate('chip_label')}</Label>
                                <Input
                                    id="edit-animal-chip"
                                    type="text"
                                    name="chip_number"
                                    value={chipNumber}
                                    set={setChipNumber}
                                    setErrors={setErrors}
                                    errors={errors?.chip_number}
                                    placeholder={tCreate('chip_placeholder')}
                                    className="mt-1 w-full"
                                />
                            </div>
                        </div>

                        <div className="w-full">
                            <Label htmlFor="edit-animal-notes">{tCreate('notes_label')}</Label>
                            <Textarea
                                id="edit-animal-notes"
                                name="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder={tCreate('notes_placeholder')}
                                className="mt-1 w-full min-h-[80px]"
                            />
                        </div>

                        <div className="w-full">
                            <Label>{tCreate('image_label')}</Label>

                            {defaultImages.length > 0 && (
                                <div className="mt-2 mb-3">
                                    <p className="text-sm text-muted-foreground mb-2">{tCreate('default_images')}</p>
                                    <div className="grid grid-cols-5 gap-2">
                                        {defaultImages.map(img => (
                                            <button
                                                key={img.id}
                                                type="button"
                                                onClick={() => handleSelectDefaultImage(img.id, img.image_url)}
                                                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                                                    selectedDefaultImageId === img.id
                                                        ? 'border-primary ring-2 ring-primary ring-offset-2'
                                                        : 'border-transparent hover:border-muted-foreground/50'
                                                }`}
                                            >
                                                <img
                                                    src={img.image_url}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                                {selectedDefaultImageId === img.id && (
                                                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                                        <IconCheck className="w-6 h-6 text-primary" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="mt-1 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors w-full"
                            >
                                {imagePreview && !selectedDefaultImageId ? (
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="max-h-32 mx-auto rounded"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center text-muted-foreground">
                                        <IconPhoto className="w-8 h-8 mb-2" />
                                        <span className="text-sm">{tCreate('image_placeholder')}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => onOpenChange(false)}
                        >
                            {t('cancel')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={!name.trim() || !animalTypeId || isSubmitting}
                            className="cursor-pointer"
                        >
                            {isSubmitting ? t('submitting') : t('submit')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}