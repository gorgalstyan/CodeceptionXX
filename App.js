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
import Slider from '@react-native-community/slider';

import moment from 'moment'

const roomsData = require('./fixtures/CA-KM-MeetingRooms.json')

const regex = /capacity/ig;

// const rooms = roomsData.map(rd => rd.Id).map(rd => {
//   const parts = rd.Name.split(regex) || []
//   const sub = parts[1];
//   return {
//     ...rd,
//     title: parts[0] || rd.Name,
//     subTitle: (sub && `Capacity ${sub}`) || '',
//   };
// });

function getRoomData(id) {
  const roomData = roomsData[id];
  const parts = roomData.Name.split(regex) || []
  const sub = parts[1];
  return {
    ...roomData,
    title: parts[0] || roomData.Name,
    subTitle: (sub && `Capacity ${sub}`) || '',
  };
};

const minTime = 6 * 60;
const maxTime = 19 * 60;
const minMeetingDuration = 15;



type Props = {};
export default class App extends Component<Props> {
  constructor(props) {
    super(props);

    const mmt = moment();
    const mmtMidnight = mmt.clone().startOf('day');
    let currentMins = mmt.diff(mmtMidnight, 'minutes');
    currentMins = Math.floor(currentMins / 15) * 15;

    this.state = {
      foundRooms: {},
      startTime: currentMins,
      endTime: currentMins + 60,
    }
  }

  componentWillMount() {
    Beacons.requestWhenInUseAuthorization();
    Beacons.startRangingBeaconsInRegion({ identifier: 'Thanks', uuid: 'FDA50693-A4E2-4FB1-AFCF-C6EB07647825' });
    Beacons.startUpdatingLocation();
    DeviceEventEmitter.addListener('beaconsDidRange', (data) => {
      console.log('found becons', data);
      Beacons.startRangingBeaconsInRegion({ identifier: 'Thanks', uuid: 'FDA50693-A4E2-4FB1-AFCF-C6EB07647825' });
      Beacons.startUpdatingLocation();

      DeviceEventEmitter.addListener('beaconsDidRange', (data) => {
        let newFoundRooms = {};
        data.beacons.forEach(element => {
          newFoundRooms = this.state.foundRooms;
          newFoundRooms[element.major] = {
            proximity: element.proximity,
            distance: element.accuracy ? element.accuracy.toFixed(2) : 20,
            ...getRoomData(element.major)
          }
          console.log('found rooms', newFoundRooms);
          const roomArray = Object.keys(newFoundRooms).map(i => newFoundRooms[i])
          this.setState({
            foundRooms: newFoundRooms,
            roomArray: roomArray
          });
        });
        // console.log('found beacons', this.state.foundRooms);
      });
    });
  }

  componentWillUnMount() {
    this.beaconsDidRange = null;
  }

  keyExtractor = (item, index) => item.EmailAddress;

  renderItem = ({ item }) => (
    <ListItem
      title={item.title}
      subtitle={item.subTitle + ' Distance: ' + item.distance + 'm'}
      // leftAvatar={{ source: { uri: item.avatar_url } }}
      bottomDivider={true}
    />
  )

  onStartValueChange(val) {
    const dur = this.state.endTime - this.state.startTime;
    let startTime = val;
    let endTime = startTime + dur;
    if (endTime > maxTime) {
      endTime = maxTime;
    }
    const maxStart = endTime - minMeetingDuration;
    if (maxStart < startTime) startTime = maxStart;
    this.setState({
      startTime,
      endTime,
    }
    )
  }

  onEndValueChange(val) {
    let startTime = this.state.startTime;
    let endTime = val;
    const maxStart = endTime - minMeetingDuration;
    if (maxStart < startTime) startTime = maxStart;
    if (startTime < minTime) {
      startTime = minTime;
      endTime = startTime + minMeetingDuration;
    };
    this.setState({
      startTime,
      endTime,
    }
    )
  }

  render() {
    const startTime = this.state.startTime;
    const endTime = this.state.endTime;
    // const startTimeText = moment(0, 'HH').add(startTime, 'm').format("h:mm a");
    const startTimeText = moment(0, 'HH').add(startTime, 'm').format("h:mm a");
    const endTimeText = moment(0, 'HH').add(endTime, 'm').format("h:mm a");
    return (
      <SafeAreaView style={styles.droidSafeArea}>
        <View>
          <Text style={{ padding: 10, fontSize: 20 }}>{startTimeText} - {endTimeText}</Text>
          <Slider
            style={{ height: 50 }}
            value={this.state.startTime}
            minimumValue={minTime}
            maximumValue={maxTime}
            step={5}
            onValueChange={val => this.onStartValueChange(val)}
          />
          <Slider
            style={{ height: 50 }}
            value={this.state.endTime}
            minimumValue={minTime}
            maximumValue={maxTime}
            step={5}
            onValueChange={val => this.onEndValueChange(val)}
          />
        </View>
        {Object.keys(this.state.foundRooms).length > 0 ? <FlatList
          keyExtractor={this.keyExtractor}
          data={this.state.roomArray}
          renderItem={this.renderItem}
        /> : <Text>No Nearby Rooms Available</Text>}
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
