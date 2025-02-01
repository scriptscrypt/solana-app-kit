import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },
    content: {
        padding: 16,
        width : "100%"
    },
    coin: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        justifyContent: 'center',
        marginVertical: 24
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 20,
        resizeMode: 'cover'
    },
    coinText: {
        fontWeight: 'bold',
        fontSize: 16
    },
    priceContainer: {
        alignItems: 'center'
    },
    mainPrice: {
        fontSize: 32,
        color: '#000000',
        fontWeight: 'bold',
        marginBottom: 4
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 6,
        alignItems: 'center',
    },
    statsText: {
        color: '#32D4DE',
        fontSize: 16,
        fontWeight: '600',
        // backgroundColor : "#D6FDFF"
    },
    statsTextPercentage : {
        color: '#32D4DE',
        fontSize: 16,
        fontWeight: '600',
        padding : 4,
        backgroundColor : "#D6FDFF",
        borderRadius : 6,
    }
});
