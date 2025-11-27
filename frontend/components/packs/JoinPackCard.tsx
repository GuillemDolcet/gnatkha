import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import { ErrorMessageType } from "@/types/common";

interface JoinPackCardProps {
    onJoin: (code: string) => Promise<{ success: boolean }>;
    errors?: Record<string, ErrorMessageType[]>;
    setErrors: React.Dispatch<React.SetStateAction<Record<string, ErrorMessageType[]>>>;
}

export default function JoinPackCard({ onJoin, errors = {}, setErrors }: JoinPackCardProps) {
    const t = useTranslations('packs.join');
    const tToast = useTranslations('packs.toast');
    const [code, setCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleJoin = async () => {
        if (code.length !== 8) return;

        setIsSubmitting(true);
        const result = await onJoin(code);
        setIsSubmitting(false);

        if (result.success) {
            toast.success(tToast('pack_joined'));
            setCode('');
        }
    };

    return (
        <Card className="flex flex-col p-6 md:flex-grow">
            <h2 className="text-lg font-semibold">{t('card_title')}</h2>
            <p className="text-sm text-muted-foreground mb-4">
                {t('card_description')}
            </p>
            <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                    <div className="flex-1">
                        <Input
                            type="text"
                            name="invitation_code"
                            placeholder={t('placeholder')}
                            value={code}
                            set={setCode}
                            setErrors={setErrors}
                            errors={errors?.invitation_code}
                            maxLength={8}
                        />
                    </div>
                    <Button
                        className="cursor-pointer"
                        onClick={handleJoin}
                        disabled={code.length !== 8 || isSubmitting}
                    >
                        {isSubmitting ? t('submitting') : t('button')}
                    </Button>
                </div>
            </div>
        </Card>
    );
}