declare module 'react-native-config' {
    export interface NativeConfig {
        BASE_URL: string;
        PORT: number;
    }

    export const Config: NativeConfig
    export default Config
}
