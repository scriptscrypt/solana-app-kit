import React from 'react';
import { View, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Circle } from 'react-native-svg';

interface LineGraphProps {
  data: number[];
  width?: number;
}

const LineGraph: React.FC<LineGraphProps> = ({ data, width }) => {
  const screenWidth = width || Dimensions.get('window').width - 32;

  return (
    <LineChart
      data={{
        labels: ["", "", "", "", "", ""],
        datasets: [
          {
            data: data,
            strokeWidth: 4, // Thicker line
            color: () => '#318EF8' // Solid blue color
          }
        ]
      }}
      width={screenWidth - 32}
      height={200}
      chartConfig={{
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        decimalPlaces: 0,
        color: () => 'transparent', // Hide grid lines
        labelColor: () => 'transparent', // Hide labels
        style: {
          borderRadius: 16
        },
        propsForDots: {
          r: '0', // Hide dots
        },
        propsForBackgroundLines: {
          strokeWidth: 0 // Hide grid lines
        },
        propsForLabels: {
          fontSize: 0 // Hide label text
        }
      }}
      bezier
      withHorizontalLines={false}
      withVerticalLines={false}
      withDots={true}
      renderDotContent={({x, y, index}) => {
        if (index === data.length - 1) {
          return (
            <Circle
              key={index}
              cx={x}
              cy={y}
              r={8}
              stroke="#318EF8"
              strokeWidth={4}
              fill="white"
            />
          );
        }
        return null;
      }}
      withShadow={false}
      style={{
        marginVertical: 8,
        borderRadius: 16,
        paddingRight: 4,
        paddingLeft: 6
      }}
    />
  );
};

export default LineGraph;
