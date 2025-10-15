
import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null | undefined = undefined;

function getAiInstance(): GoogleGenAI | null {
    if (ai === undefined) {
        // In a browser environment without a build step, process.env might not exist.
        const apiKey = (typeof process !== 'undefined' && process.env && process.env.API_KEY)
            ? process.env.API_KEY
            : undefined;

        if (!apiKey) {
            console.error("API_KEY environment variable not set. AI features are disabled.");
            ai = null;
        } else {
            try {
                ai = new GoogleGenAI({ apiKey });
            } catch (error) {
                console.error("Failed to initialize GoogleGenAI:", error);
                ai = null;
            }
        }
    }
    return ai;
}


export const generateReminder = async (clubName: string, monthName: string): Promise<string> => {
    const aiInstance = getAiInstance();
    if (!aiInstance) {
        return "عذرًا، خدمة الذكاء الاصطناعي غير متاحة حاليًا. يرجى التأكد من تكوين مفتاح API بشكل صحيح.";
    }

    const prompt = `
    أنت مساعد مشرف أندية طلابية في جامعة. مهمتك هي كتابة رسالة تذكير احترافية ومشجعة لرئيس نادي طلابي.
    
    الهدف من الرسالة هو تنبيه رئيس النادي بأن النادي لم يقم بجدولة أي فعاليات للشهر الحالي وتشجيعه على التخطيط لأنشطة قادمة.
    
    معلومات:
    - اسم النادي: ${clubName}
    - الشهر الحالي: ${monthName}
    
    الرجاء كتابة رسالة بريد إلكتروني قصيرة وواضحة باللغة العربية. يجب أن تكون الرسالة ودية وداعمة، لا توبيخية. اقترح في الرسالة أن المشرف مستعد لتقديم المساعدة أو الدعم إذا احتاج النادي ذلك.
    
    ابدأ الرسالة بـ "عزيزي رئيس ${clubName}،" واختمها بـ "مع خالص التقدير، مشرف الأندية الطلابية".
    `;

    try {
        const response = await aiInstance.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "أنت مساعد ذكي ومتخصص في صياغة المراسلات الإدارية والأكاديمية باللغة العربية. يجب أن تكون إجاباتك احترافية وداعمة.",
                temperature: 0.7,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating reminder:", error);
        return "عذرًا، حدث خطأ أثناء محاولة إنشاء رسالة التذكير. يرجى المحاولة مرة أخرى.";
    }
};
