import React from 'react'
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native'
import { styles } from './TopSection.style'
import Icons from '../../../../assets/svgs/index'
import { FlatList } from 'react-native-gesture-handler'
import { SuggestionsCard, Tweet } from '../../../../components'
import LineGraph from './LineGraph'

const cardData = Array(10).fill({})
const tweetData = [
    {
        username: "SendAI",
        handle: "@SendAI",
        time: "2h",
        tweetContent: "Building the future of Solana with $SEND",
        quoteCount: 123,
        retweetCount: 456,
        reactionCount: 789,
        avatar: require("../../../../assets/images/Smiley.png")
    },
    {
        username: "SolanaBuilder",
        handle: "@SolanaBuilder",
        time: "4h",
        tweetContent: "Just bought more $SEND tokens! The ecosystem is growing fast 🚀",
        quoteCount: 245,
        retweetCount: 678,
        reactionCount: 912,
        avatar: require("../../../../assets/images/Smiley.png")
    }
]



const graphData = [50, 80, 60, 90, 70, 95, 88, 85, 91, 85, 87, 89];


export const TopScreen = () => {


    const renderCard = () => (
        <View style={styles.cardContainer}>
            <SuggestionsCard />
        </View>
    )
    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.coin}>
                    <View>
                        <Image
                            source={require("../../../../assets/images/Smiley.png")}
                            style={styles.avatar}
                        />
                    </View>
                    <Text style={styles.coinText}>$SEND</Text>
                </View>
                <View style={styles.priceContainer}>
                    <Text style={styles.mainPrice}>$0.129585</Text>
                    <View style={styles.statsContainer}>
                        <Text style={styles.statsText}>+$0.021113</Text>
                        <Text style={styles.statsTextPercentage}>+477%</Text>
                    </View>
                </View>
                <View style={styles.graphSection}>
                <LineGraph data={graphData} />

                    <View style={styles.timeframeButtons}>
                        {['1H', '1D', '1W', '1M', 'All'].map((timeframe) => (
                            <TouchableOpacity
                                key={timeframe}
                                style={styles.timeButton}
                            >
                                <Text style={styles.timeButtonText}>{timeframe}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.swapButton}>
                        <Icons.SwapIcon width={24} height={24} />
                        <Text style={styles.swapButtonText}>Swap</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.sendButton}>
                        <Icons.arrow width={24} height={24} fill="white" />


                        <Text style={styles.sendButtonText}>Send</Text>
                    </TouchableOpacity>
                </View>
                <View>
                    <View style={styles.holdersHeader}>
                        <Icons.infoIcon />
                        <Text style={styles.holdersTitle}>About</Text>
                    </View>
                    <View style={styles.descriptionContainer}>
                        <Text style={styles.descriptionText}>
                            An Ecosystem token empowering the builders of Solana
                        </Text>
                        <TouchableOpacity style={styles.showMoreButton}>
                            <Text style={styles.showMoreText}>Show more</Text>
                            <Icons.arrowDown/>
                        </TouchableOpacity>
                    </View>

                </View>
                <View style={styles.content}>

                    <View style={styles.holdersHeader}>
                        <Icons.infoIcon width={24} height={24} />
                        <Text style={styles.holdersTitle}>People who recently bought SEND</Text>
                    </View>
                </View>
                <View>
                    <FlatList
                        horizontal
                        data={cardData}
                        renderItem={renderCard}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.cardList}
                    />
                </View>
                <View style={styles.borderLine} />
                <View style={styles.tweetSection}>
                    <Tweet data={tweetData} />
                </View>


            </View>
        </ScrollView>
    )
}
