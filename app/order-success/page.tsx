"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [whatsappProtocolLink, setWhatsappProtocolLink] = useState<string | null>(null);
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [showManualOptions, setShowManualOptions] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const whatsappLink = searchParams.get('link');
        if (whatsappLink) {
            const decodedLink = decodeURIComponent(whatsappLink);

            try {
                const url = new URL(decodedLink);
                const phone = url.pathname.replace('/', '');
                const msg = url.searchParams.get('text') || '';

                setPhoneNumber(phone);
                setMessage(msg);

                const protocolLink = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(msg)}`;
                setWhatsappProtocolLink(protocolLink);

                console.log('WhatsApp setup:', {
                    phone,
                    messageLength: msg.length,
                    protocolLink: protocolLink.substring(0, 100)
                });
            } catch (e) {
                console.error('Error parsing link:', e);
            }
        }
    }, [searchParams]);

    const tryOpenWhatsApp = () => {
        if (!whatsappProtocolLink) return;

        console.log('Trying to open WhatsApp...');

        // Method 1: Try iframe (sometimes works on iOS)
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = whatsappProtocolLink;
        document.body.appendChild(iframe);

        // Method 2: Direct navigation after short delay
        setTimeout(() => {
            window.location.href = whatsappProtocolLink;
        }, 100);

        // Method 3: Show manual options after 2 seconds if nothing happened
        setTimeout(() => {
            setShowManualOptions(true);
        }, 2000);

        // Clean up iframe
        setTimeout(() => {
            if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
            }
        }, 1000);
    };

    const copyToClipboard = async () => {
        if (!message || !phoneNumber) return;

        try {
            await navigator.clipboard.writeText(message);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);

            // Also try to open WhatsApp to the number
            window.location.href = `whatsapp://send?phone=${phoneNumber}`;
        } catch (e) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = message;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center animate-fade-in-up">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-gray-800 mb-2">✅ Pedido Confirmado!</h1>
                <p className="text-gray-600 mb-6">
                    Seu pedido foi registrado com sucesso!
                </p>

                {whatsappProtocolLink && (
                    <div className="w-full space-y-4">
                        {/* Main WhatsApp Button */}
                        <button
                            onClick={tryOpenWhatsApp}
                            className="block w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-5 px-6 rounded-xl shadow-lg transform active:scale-95 transition-all text-lg flex items-center justify-center gap-3"
                        >
                            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-868-2.031-.967-.272-.099-.47-.148-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                            </svg>
                            Enviar Pedido no WhatsApp
                        </button>

                        {/* Manual Options (shown after delay or on demand) */}
                        {showManualOptions && (
                            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 animate-fade-in">
                                <p className="text-sm font-bold text-yellow-900 mb-3">
                                    📱 WhatsApp não abriu? Tente manualmente:
                                </p>

                                <div className="space-y-3">
                                    {/* Copy Message Button */}
                                    <button
                                        onClick={copyToClipboard}
                                        className="w-full bg-white border-2 border-yellow-400 text-yellow-900 font-bold py-3 px-4 rounded-lg hover:bg-yellow-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        {copied ? (
                                            <>
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Copiado!
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                                </svg>
                                                Copiar Mensagem
                                            </>
                                        )}
                                    </button>

                                    {/* Direct WhatsApp Link */}
                                    <a
                                        href={`whatsapp://send?phone=${phoneNumber}`}
                                        className="block w-full bg-[#25D366] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#128C7E] transition-all text-center"
                                    >
                                        Abrir WhatsApp e Colar
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Show Manual Options Button */}
                        {!showManualOptions && (
                            <button
                                onClick={() => setShowManualOptions(true)}
                                className="text-sm text-gray-500 hover:text-gray-700 underline"
                            >
                                WhatsApp não abriu? Clique aqui
                            </button>
                        )}
                    </div>
                )}

                <button
                    onClick={() => router.push('/')}
                    className="mt-6 text-gray-400 font-medium hover:text-gray-600 transition-colors underline"
                >
                    Voltar ao Início
                </button>
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Carregando...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
