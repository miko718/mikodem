// ============================================================================
// קונפיגורציית מסלולי מנוי
// ============================================================================
// קובץ זה מכיל את המחירים והתכונות של כל מסלול מנוי
// ניתן לעדכן את המחירים כאן לפי הצורך

export type SubscriptionPlan = 'basic' | 'premium';

export interface PlanFeatures {
  title: string;
  description?: string;
}

export interface SubscriptionPlanConfig {
  id: SubscriptionPlan;
  name: string;
  monthlyPrice: number; // מחיר חודשי בשקלים
  annualPrice: number; // מחיר שנתי בשקלים
  annualDiscount: number; // אחוז הנחה לשנתי (למשל 15)
  features: PlanFeatures[];
  recommended?: boolean; // האם זה המסלול המומלץ
}

// ============================================================================
// הגדרת מסלולי מנוי
// ============================================================================

export const SUBSCRIPTION_PLANS: Record<
  SubscriptionPlan,
  SubscriptionPlanConfig
> = {
  basic: {
    id: 'basic',
    name: 'מנוי בסיסי',
    monthlyPrice: 30,
    annualPrice: 306, // 30 * 12 * 0.85 (15% הנחה)
    annualDiscount: 15,
    features: [
      {
        title: 'כוח קנייה קבוצתי',
      },
      {
        title: 'גישה לפורום הקהילה',
      },
    ],
  },
  premium: {
    id: 'premium',
    name: 'מנוי פרימיום',
    monthlyPrice: 60,
    annualPrice: 612, // 60 * 12 * 0.85 (15% הנחה)
    annualDiscount: 15,
    recommended: true,
    features: [
      {
        title: 'סיוע משפטי וליווי',
        description: 'הגנה משפטית מלאה לעסק שלך',
      },
      {
        title: 'הטבות בנקאיות',
        description: 'עמלות מופחתות ותנאי אשראי',
      },
      {
        title: 'השפעה פוליטית',
        description: 'ייצוג ישיר מול מקבלי החלטות',
      },
    ],
  },
};

// ============================================================================
// הטבות נוספות למנוי פרימיום
// ============================================================================

export const PREMIUM_ADDITIONAL_BENEFITS: PlanFeatures[] = [
  {
    title: 'כל הטבות הפרימיום',
  },
  {
    title: 'מנהל תיק אישי VIP',
  },
  {
    title: 'גישה בלעדית לאירועי נטוורקינג',
  },
];

// ============================================================================
// "למה כדאי להצטרף?" - אייקונים ותיאורים
// ============================================================================

export interface WhyJoinItem {
  icon: string; // שם האייקון מ-lucide-react-native
  title: string;
}

export const WHY_JOIN_ITEMS: WhyJoinItem[] = [
  {
    icon: 'Building2',
    title: 'הטבות בנקים',
  },
  {
    icon: 'Scale',
    title: 'הגנה משפטית',
  },
  {
    icon: 'Users',
    title: 'כוח קבוצתי',
  },
];
