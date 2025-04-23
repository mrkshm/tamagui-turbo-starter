import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Anchor, Button, H1, Paragraph, Separator, Sheet, useToastController, XStack, YStack, } from '@bbook/ui';
import { ChevronDown, ChevronUp } from '@tamagui/lucide-icons';
import { useState } from 'react';
import { Platform } from 'react-native';
export function HomeScreen({ pagesMode = false }) {
    return (_jsxs(YStack, { flex: 1, justifyContent: "center", alignItems: "center", gap: "$8", padding: "$4", background: "$background", children: [_jsx(XStack, { position: "absolute", width: "100%", top: "$6", gap: "$6", justifyContent: "center", flexWrap: "wrap", "$sm": { position: 'relative', top: 0 }, children: Platform.OS === 'web' && _jsx(_Fragment, {}) }), _jsxs(YStack, { gap: "$4", children: [_jsx(H1, { textAlign: "center", color: "$color12", children: "Welcome to Tamagui." }), _jsx(Paragraph, { color: "$color10", textAlign: "center", children: "Here's a basic starter to show navigating from one screen to another." }), _jsx(Separator, {}), _jsx(Paragraph, { textAlign: "center", children: "This screen uses the same code on Next.js and React Native." }), _jsx(Separator, {})] }), _jsx(SheetDemo, {})] }));
}
function SheetDemo() {
    const toast = useToastController();
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState(0);
    return (_jsxs(_Fragment, { children: [_jsx(Button, { size: "$6", icon: open ? ChevronDown : ChevronUp, circular: true, onPress: () => setOpen((x) => !x) }), _jsxs(Sheet, { modal: true, animation: "medium", open: open, onOpenChange: setOpen, snapPoints: [80], position: position, onPositionChange: setPosition, dismissOnSnapToBottom: true, children: [_jsx(Sheet.Overlay, { background: "$shadow4", animation: "lazy", enterStyle: { opacity: 0 }, exitStyle: { opacity: 0 } }), _jsx(Sheet.Handle, { bg: "$color8" }), _jsxs(Sheet.Frame, { alignItems: "center", justifyContent: "center", gap: "$10", background: "$color2", children: [_jsxs(XStack, { gap: "$2", children: [_jsx(Paragraph, { textAlign: "center", children: "Made by" }), _jsx(Anchor, { color: "$blue10", href: "https://twitter.com/natebirdman", target: "_blank", children: "@natebirdman," }), _jsx(Anchor, { color: "$blue10", href: "https://github.com/tamagui/tamagui", target: "_blank", rel: "noreferrer", children: "give it a \u2B50\uFE0F" })] }), _jsx(Button, { size: "$6", circular: true, icon: ChevronDown, onPress: () => {
                                    setOpen(false);
                                    toast.show('Sheet closed!', {
                                        message: 'Just showing how toast works...',
                                    });
                                } })] })] })] }));
}
