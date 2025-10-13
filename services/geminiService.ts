
import { GoogleGenAI } from "@google/genai";

// Ensure the API key is available in the environment variables
const apiKey = process.env.API_KEY;
if (!apiKey) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey });

export const generateReminder = async (clubName: string, monthName: string): Promise<string> => {
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
        const response = await ai.models.generateContent({
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
