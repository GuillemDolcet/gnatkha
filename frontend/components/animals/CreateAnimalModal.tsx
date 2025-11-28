import { useState, useRef, useMemo, useEffect } from "react";
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
import { AnimalType, AnimalSex } from "@/types/animal";
import { Pack } from "@/types/pack";
import { ErrorMessageType } from "@/types/common";

interface ActionResult {
    success: boolean;
    error?: 'forbidden' | 'not_found' | 'unknown';
}

interface CreateAnimalModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    packs: Pack[];
    animalTypes: AnimalType[];
    onCreate: (data: {
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
    }) => Promise<ActionResult>;
    defaultPackId?: number | null;
}

export default function CreateAnimalModal({
                                              open,
                                              onOpenChange,
                                              packs,
                                              animalTypes,
                                              onCreate,
                                              defaultPackId,
                                          }: CreateAnimalModalProps) {
    const t = useTranslations('animals.create');
    const tSex = useTranslations('animals.sex');
    const tTypes = useTranslations('animals.types');
    const tToast = useTranslations('animals.toast');

    const [name, setName] = useState('');
    const [animalTypeId, setAnimalTypeId] = useState<string>('');
    const [packId, setPackId] = useState<string>(defaultPackId?.toString() ?? '');
    const [breed, setBreed] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [sex, setSex] = useState<string>('unknown');
    const [weight, setWeight] = useState('');
    const [chipNumber, setChipNumber] = useState('');
    const [notes, setNotes] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedDefaultImageId, setSelectedDefaultImageId] = useState<number | null>(null);
    const [errors, setErrors] = useState<Record<string, ErrorMessageType[]>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open && defaultPackId) {
            setPackId(defaultPackId.toString());
        }
    }, [open, defaultPackId]);

    const selectedType = useMemo(() => {
        return animalTypes.find(t => t.id.toString() === animalTypeId);
    }, [animalTypes, animalTypeId]);

    const defaultImages = selectedType?.default_images ?? [];

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
        if (!name.trim() || !animalTypeId || !packId) return;

        setIsSubmitting(true);
        const result = await onCreate({
            name: name.trim(),
            animal_type_id: parseInt(animalTypeId),
            pack_id: parseInt(packId),
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
            toast.success(tToast('animal_created'));
            resetForm();
            onOpenChange(false);
        }
    };

    const resetForm = () => {
        setName('');
        setAnimalTypeId('');
        setPackId('');
        setBreed('');
        setBirthDate('');
        setSex('unknown');
        setWeight('');
        setChipNumber('');
        setNotes('');
        setImage(null);
        setImagePreview(null);
        setSelectedDefaultImageId(null);
        setErrors({});
    };

    const handleOpenChange = (isOpen: boolean) => {
        onOpenChange(isOpen);
        if (!isOpen) {
            resetForm();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
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
                            <Label htmlFor="animal-name">{t('name_label')}</Label>
                            <Input
                                id="animal-name"
                                type="text"
                                name="name"
                                value={name}
                                set={setName}
                                setErrors={setErrors}
                                errors={errors?.name}
                                placeholder={t('name_placeholder')}
                                className="mt-1 w-full"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="w-full">
                                <Label htmlFor="animal-type">{t('type_label')}</Label>
                                <Select value={animalTypeId} onValueChange={handleTypeChange}>
                                    <SelectTrigger className="mt-1 w-full cursor-pointer">
                                        <SelectValue placeholder={t('type_placeholder')} />
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
                                <Label htmlFor="animal-pack">{t('pack_label')}</Label>
                                <Select value={packId} onValueChange={setPackId}>
                                    <SelectTrigger className="mt-1 w-full cursor-pointer">
                                        <SelectValue placeholder={t('pack_placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {packs.map(pack => (
                                            <SelectItem
                                                key={pack.id}
                                                value={pack.id.toString()}
                                                className="cursor-pointer"
                                            >
                                                {pack.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="w-full">
                            <Label htmlFor="animal-breed">{t('breed_label')}</Label>
                            <Input
                                id="animal-breed"
                                type="text"
                                name="breed"
                                value={breed}
                                set={setBreed}
                                setErrors={setErrors}
                                errors={errors?.breed}
                                placeholder={t('breed_placeholder')}
                                className="mt-1 w-full"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="w-full">
                                <Label htmlFor="animal-birth-date">{t('birth_date_label')}</Label>
                                <Input
                                    id="animal-birth-date"
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
                                <Label htmlFor="animal-sex">{t('sex_label')}</Label>
                                <Select value={sex} onValueChange={setSex}>
                                    <SelectTrigger className="mt-1 w-full cursor-pointer">
                                        <SelectValue placeholder={t('sex_placeholder')} />
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
                                <Label htmlFor="animal-weight">{t('weight_label')}</Label>
                                <Input
                                    id="animal-weight"
                                    type="number"
                                    name="weight"
                                    value={weight}
                                    set={setWeight}
                                    setErrors={setErrors}
                                    errors={errors?.weight}
                                    placeholder={t('weight_placeholder')}
                                    className="mt-1 w-full"
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            <div className="w-full">
                                <Label htmlFor="animal-chip">{t('chip_label')}</Label>
                                <Input
                                    id="animal-chip"
                                    type="text"
                                    name="chip_number"
                                    value={chipNumber}
                                    set={setChipNumber}
                                    setErrors={setErrors}
                                    errors={errors?.chip_number}
                                    placeholder={t('chip_placeholder')}
                                    className="mt-1 w-full"
                                />
                            </div>
                        </div>

                        <div className="w-full">
                            <Label htmlFor="animal-notes">{t('notes_label')}</Label>
                            <Textarea
                                id="animal-notes"
                                name="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder={t('notes_placeholder')}
                                className="mt-1 w-full min-h-[80px]"
                            />
                        </div>

                        <div className="w-full">
                            <Label>{t('image_label')}</Label>

                            {defaultImages.length > 0 && (
                                <div className="mt-2 mb-3">
                                    <p className="text-sm text-muted-foreground mb-2">{t('default_images')}</p>
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
                                        <span className="text-sm">{t('image_placeholder')}</span>
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
                            onClick={() => handleOpenChange(false)}
                        >
                            {t('cancel')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={!name.trim() || !animalTypeId || !packId || isSubmitting}
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