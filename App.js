/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { FlatList, StyleSheet, Text, View, SafeAreaView, Platform, DeviceEventEmitter } from 'react-native';
import Beacons from 'react-native-beacons-manager';
import { ListItem } from 'react-native-elements'
import RangeSlider from 'react-native-range-slider'

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

    this.state = {
      foundRooms: [],
    }
  }

  componentWillMount() {
    Beacons.requestWhenInUseAuthorization();
    Beacons.startRangingBeaconsInRegion({identifier: 'Thanks', uuid: 'FDA50693-A4E2-4FB1-AFCF-C6EB07647825'});
    Beacons.startUpdatingLocation();

    DeviceEventEmitter.addListener('beaconsDidRange', (data) => {
      console.log('found becons', data);
      let newFoundRooms = {};
      data.beacons.forEach(element => {
        newFoundRooms = this.state.foundRooms;
        newFoundRooms[element.major] = {
          proximity: element.proxomity,
          distance: element.accuracy ? element.accuracy.toFixed(2) : 20
        }
        this.setState({
          foundRooms: newFoundRooms
        });
      });
    });
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
        <RangeSlider
          minValue={0}
          maxValue={100}
          tintColor={'#da0f22'}
          handleBorderWidth={1}
          handleBorderColor="#454d55"
          selectedMinimum={20}
          selectedMaximum={40}
          style={{ flex: 1, height: 70, padding: 10, backgroundColor: '#ddd' }}
          onChange={(data) => { console.log(data); }}
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
