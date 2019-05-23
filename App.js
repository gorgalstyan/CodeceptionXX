/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { FlatList, StyleSheet, Text, View, SafeAreaView, Platform } from 'react-native';

import { ListItem } from 'react-native-elements'

const roomsData = require('./fixtures/CA-KM-MeetingRooms.json')

const regex = /capacity/ig;

const rooms = roomsData.map(rd => rd.Id).map(rd => {
  const parts = rd.Name.split(regex) || []
  const sub = parts[1];
  return {
    ...rd,
    title: parts[0] || rd.Name,
    subTitle: (sub && `Capacity ${sub}`) || '',
  };
});

type Props = {};
export default class App extends Component<Props> {
  constructor(props) {
    super(props);
  }

  keyExtractor = (item, index) => item.EmailAddress;

  renderItem = ({ item }) => (
    <ListItem
      title={item.title}
      subtitle={item.subTitle}
      // leftAvatar={{ source: { uri: item.avatar_url } }}
      bottomDivider={true}
    />
  )

  render() {
    return (
      <SafeAreaView style={styles.droidSafeArea}>
        <FlatList
          keyExtractor={this.keyExtractor}
          data={rooms}
          renderItem={this.renderItem}
        />
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  droidSafeArea: {
    flex: 1,
    // backgroundColor: npLBlue,
    paddingTop: Platform.OS === 'android' ? 25 : 0
  },
});
