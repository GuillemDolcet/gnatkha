import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ErrorMessageType } from '@/types/common';

interface CreatePackCardProps {
    onCreate: (name: string) => Promise<{ success: boolean }>;
    errors?: Record<string, ErrorMessageType[]>;
    setErrors: React.Dispatch<React.SetStateAction<Record<string, ErrorMessageType[]>>>;
}

export default function CreatePackCard({ onCreate, errors = {}, setErrors }: CreatePackCardProps) {
    const t = useTranslations('packs.create');
    const tToast = useTranslations('packs.toast');
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsSubmitting(true);
        const result = await onCreate(name.trim());
        setIsSubmitting(false);

        if (result.success) {
            toast.success(tToast('pack_created'));
            setName('');
            setOpen(false);
        }
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            setName('');
            setErrors({});
        }
    };

    return (
        <>
            <Card className="flex flex-col justify-between p-6 md:w-1/3 lg:w-1/4 bg-emerald-50 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-700">
                <div>
                    <h2 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">{t('card_title')}</h2>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-4">
                        {t('card_description')}
                    </p>
                </div>
                <Button
                    onClick={() => setOpen(true)}
                    className="w-full cursor-pointer bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                >
                    {t('button')}
                </Button>
            </Card>

            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>{t('modal_title')}</DialogTitle>
                            <DialogDescription>
                                {t('modal_description')}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4">
                            <Label htmlFor="pack-name">{t('name_label')}</Label>
                            <Input
                                id="pack-name"
                                type="text"
                                name="name"
                                value={name}
                                set={setName}
                                setErrors={setErrors}
                                errors={errors?.name}
                                placeholder={t('name_placeholder')}
                                className="mt-2"
                                autoFocus
                            />
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
                                disabled={!name.trim() || isSubmitting}
                                className="cursor-pointer bg-emerald-600 hover:bg-emerald-700"
                            >
                                {isSubmitting ? t('submitting') : t('submit')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}