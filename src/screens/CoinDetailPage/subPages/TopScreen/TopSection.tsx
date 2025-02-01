import React from 'react'
import { View, Text, Image } from 'react-native'
import { styles } from './TopSection.style'

export const TopScreen = () => {
    return (
        <View style={styles.container}>
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
            </View>
        </View>
    )
}
