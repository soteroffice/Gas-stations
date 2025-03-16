import React from 'react';
import { View, StyleSheet } from 'react-native';
import { VictoryChart, VictoryLine, VictoryAxis } from 'victory-native';

const PriceTrendsChart = ({ data }) => (
  <View style={styles.container}>
    <VictoryChart>
      <VictoryLine
        data={data}
        x="date"
        y="price"
      />
      <VictoryAxis
        tickFormat={(t) => new Date(t).toLocaleDateString()}
      />
      <VictoryAxis
        dependentAxis
        tickFormat={(t) => `$${t}`}
      />
    </VictoryChart>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
});

export default PriceTrendsChart;
