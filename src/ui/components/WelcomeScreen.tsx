import { TextAttributes } from "@opentui/core";

export function WelcomeScreen() {
    return (
        <box style={{
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <box style={{
                flexDirection: 'column',
                gap: 1,
                width: '60%',
                border: true,
                borderStyle: 'rounded',
                borderColor: '#99BB70',
                backgroundColor: '#151613',
                padding: 2,
            }}>
                <text style={{ fg: '#BAD29C', attributes: TextAttributes.BOLD }}>
                    Welcome to Gloo!
                </text>
                <text style={{ fg: '#B5BAAF' }}>
                    You haven't set up a provider yet.
                </text>
                <box style={{ flexDirection: 'column', marginTop: 1 }}>
                    <text style={{ fg: '#515A46' }}>To get started:</text>
                    <text style={{ fg: '#B5BAAF' }}>
                        {'  Press '}
                        <span fg='#99BB70' attributes={TextAttributes.BOLD}>s</span>
                        {' to open settings and add a provider'}
                    </text>
                    <text style={{ fg: '#B5BAAF' }}>
                        {'  Type  '}
                        <span fg='#99BB70' attributes={TextAttributes.BOLD}>:q</span>
                        {' to quit'}
                    </text>
                </box>
            </box>
        </box>
    );
}
