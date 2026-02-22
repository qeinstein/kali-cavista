"use client";

import { useTranslation } from "react-i18next";

export default function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="w-full border-t border-foreground/5 py-12 px-4 text-center">
            <p className="text-sm text-foreground/20">
                {t('footer.rights', "© 2026 SPAG — National Prevention Engine. All rights reserved.")}
            </p>
        </footer>
    );
}
