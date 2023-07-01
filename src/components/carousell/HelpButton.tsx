export type Props = {
    text: string
}

export default function HelpButton({ text }: Props) {
    return (
        <>
            <button class="rounded-full w-6 h-6 ring-2 ring-white font-bold opacity-50 hover:opacity-100">?</button>
        </>
    );
}