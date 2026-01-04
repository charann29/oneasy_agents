/**
 * Central Translation Dictionary
 * Supports: English (en-US), Hindi (hi-IN), Telugu (te-IN)
 */

export type LanguageCode = 'en-US' | 'hi-IN' | 'te-IN';

export const TRANSLATIONS = {
    'en-US': {
        // UI Defaults
        appName: 'CA Business Planner',

        // Chat Interface
        phase: 'Phase',
        submit: 'Submit',
        help: 'Help me answer',
        ideas: 'Get AI Ideas...',
        takingLong: 'Taking longer than expected...',
        skip: 'Skip to Next Question',
        confirm: 'Confirm Selections',
        complete: 'Business Model Complete!',
        ready: 'Your comprehensive business architecture is ready.',
        custom: 'Add custom value...',
        start: 'Start Your Business Plan',

        // Phase Roadmap
        yourJourney: 'Your Journey',
        totalTime: 'Total Time',
        worthValue: '💎 Worth $5,000+ in consulting fees!',
        now: 'Now',
        questions: 'questions',
        whatYouGet: "What You'll Get:",

        // Phases
        phase1: 'User Profile',
        phase2: 'Business Context',
        phase3: 'Market Analysis',
        phase4: 'Revenue Model',
        phase5: 'Operations',
        phase6: 'Financial Plan',

        // Deliverables
        delivPlan: 'Complete Business Plan (PDF)',
        delivFin: '5-Year Financial Projections (Excel)',
        delivPitch: 'Pitch Deck (PowerPoint)',
        delivGTM: 'Go-to-Market Strategy',

        you: 'You',
        agentName: 'Abhishek CA'
    },
    'hi-IN': {
        appName: 'CA Business Planner',

        phase: 'चरण',
        submit: 'जमा करें',
        help: 'मेरी मदद करें',
        ideas: 'AI विचार प्राप्त करें...',
        takingLong: 'उम्मीद से अधिक समय लग रहा है...',
        skip: 'अगले प्रश्न पर जाएं',
        confirm: 'पुष्टि करें',
        complete: 'व्यवसाय मॉडल पूरा हुआ!',
        ready: 'आपकी विस्तृत व्यवसाय योजना तैयार है।',
        custom: 'अपना उत्तर लिखें...',
        start: 'अपनी योजना शुरू करें',

        yourJourney: 'आपकी यात्रा',
        totalTime: 'कुल समय',
        worthValue: '💎 ₹4,00,000+ की कंसल्टिंग फीस के बराबर!',
        now: 'अभी',
        questions: 'प्रश्न',
        whatYouGet: 'आपको क्या मिलेगा:',

        phase1: 'उपयोगकर्ता प्रोफ़ाइल',
        phase2: 'व्यवसाय संदर्भ',
        phase3: 'बाजार विश्लेषण',
        phase4: 'राजस्व मॉडल',
        phase5: 'संचालन (Operations)',
        phase6: 'वित्तीय योजना',

        delivPlan: 'पूर्ण व्यवसाय योजना (PDF)',
        delivFin: '5-वर्षीय वित्तीय अनुमान (Excel)',
        delivPitch: 'पिच डेक (PowerPoint)',
        delivGTM: 'बाजार में जाने की रणनीति',

        you: 'आप',
        agentName: 'अभिषेक CA'
    },
    'te-IN': {
        appName: 'CA Business Planner',

        phase: 'దశ',
        submit: 'సమర్పించు',
        help: 'నాకు సహాయం చేయండి',
        ideas: 'AI సలహాలు పొందండి...',
        takingLong: 'ఊహించిన దానికంటే ఎక్కువ సమయం తీసుకుంటోంది...',
        skip: 'తదుపరి ప్రశ్నకు వెళ్లండి',
        confirm: 'ధృవీకరించండి',
        complete: 'వ్యాపార నమూనా పూర్తయింది!',
        ready: 'మీ సమగ్ర వ్యాపార ప్రణాళిక సిద్ధంగా ఉంది.',
        custom: 'మీ సమాధానం రాయండి...',
        start: 'మీ ప్రణాళికను ప్రారంభించండి',

        yourJourney: 'మీ ప్రయాణం',
        totalTime: 'మొత్తం సమయం',
        worthValue: '💎 ₹4,00,000+ విలువైన కన్సల్టింగ్!',
        now: 'ప్రస్తుతం',
        questions: 'ప్రశ్నలు',
        whatYouGet: 'మీకు లభించేవి:',

        phase1: 'వినియోగదారు వివరాలు',
        phase2: 'వ్యాపార సందర్భం',
        phase3: 'మార్కెట్ విశ్లేషణ',
        phase4: 'ఆదాయ నమూనా',
        phase5: 'ఆపరేషన్స్',
        phase6: 'ఆర్థిక ప్రణాళిక',

        delivPlan: 'పూర్తి వ్యాపార ప్రణాళిక (PDF)',
        delivFin: '5-సంవత్సరాల ఆర్థిక అంచనాలు (Excel)',
        delivPitch: 'పిచ్ డెక్ (PowerPoint)',
        delivGTM: 'మార్కెటింగ్ వ్యూహం',

        you: 'మీరు',
        agentName: 'అభిషేక్ CA'
    }
};

export function getTranslation(lang: string, key: keyof typeof TRANSLATIONS['en-US']) {
    const safeLang = (lang === 'hi-IN' || lang === 'te-IN') ? lang : 'en-US';
    return TRANSLATIONS[safeLang][key] || TRANSLATIONS['en-US'][key];
}
