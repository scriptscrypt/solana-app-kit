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
    },
    graphContainer: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        // backgroundColor: '#f5f5f5',
        borderRadius: 8
    },
    graphText: {
        fontSize: 16,
        color: '#666666'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
        gap: 12
    },
    swapButton: {
        flex: 1,
        flexDirection: 'row',
        gap: 6,
        justifyContent: 'center',
        backgroundColor: 'black',
        padding: 16,
        borderRadius: 30,
        alignItems: 'center'
    },
    sendButton: {
        flex: 1,
        backgroundColor: '#318EF8',
        flexDirection: 'row',
        gap: 6,
        justifyContent: 'center',
        padding: 16,
        borderRadius: 30,
        alignItems: 'center'
    },
    swapButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600'
    },
    sendButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600'
    },
    holdersHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 20,
    },
    holdersTitle: {
        fontSize: 16,
        fontWeight: '600'
    },
    descriptionContainer: {
        marginTop: 12,
    },
    descriptionText: {
        color: '#666666',
        fontSize: 16,
        marginBottom: 12
    },
    showMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4
    },
    showMoreText: {
        color: 'black',
fontWeight : "600",
        fontSize: 16
    },
    cardContainer: {
        marginRight: 16,
    },
    cardList: {
        paddingHorizontal: 16,
    },
    borderLine: {
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
        marginTop: 16,
        marginHorizontal: 4
    },
    tweetSection: {
        marginTop: 16,
    },
    graphSection: {
        marginTop: 18,
    },
    graphLine: {
        height: 2,
        backgroundColor: '#318EF8',
        borderRadius: 4,
    },
    timeframeButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 6,
        paddingHorizontal: 50,
    },
    timeButton: {
        padding: 8,
    },
    timeButtonText: {
        color: '#666666',
        fontSize: 14,
        fontWeight: '500',
    }
    
    
    
    
    
    
});
