import React, { Component } from "react";
import { ActivityIndicator, Dimensions, StyleSheet } from 'react-native';
import { Content, Container, Header, Title, Text, Body, Separator, ListItem, View, Left, Right, Button, Icon } from "native-base";
import { createStackNavigator, createDrawerNavigator } from 'react-navigation';
import MapView, { Polyline, ProviderPropType } from 'react-native-maps';
import RNPolyline  from 'rn-maps-polyline';
import styles from "./styles";
import customGMap from "./customGMap.json";
import { API_URL, API_SITE_ID } from 'react-native-dotenv'

let convert = require('convert-units');
let moment = require('moment');

const env = {
  siteid:API_SITE_ID,
  rootpath:API_URL
};
const { width, height } = Dimensions.get('window');

 class ActivityMap extends React.Component {

   constructor(props){
     super(props);
     this.mapRef = null;
     this.state ={ isLoading: true,
                   activityId: this.props.activityMapId,
                 }
   }

  componentDidMount() {
    //const { navigation } = this.props;
    Mura.init(
      env
    );

    results = Mura.getEntity('map').loadBy('activityId',this.state.activityId)
    .then((results) => {
      //console.log(results.getAll());

      summary_polyline = RNPolyline.decode(results.get('summary_polyline'));
      //console.log(summary_polyline);
      this.setState({
        isLoading: false,
        //activityId: activityid,
        summary_polyline: summary_polyline,
        mapId: results.get('mapId'),
        polyline: results.get('polyline')
      }, function(){

      });

    }).catch((error) =>{
      console.error(error);
    });
    console.log(customGMap);
    mapStyle = customGMap;

  }


  render() {
    //console.log(this.state.polyline);
    if(this.state.isLoading){
      return(
        <View style={{flex: 1, padding: 60}}>
          <ActivityIndicator/>
        </View>
      )
    }

    return (

      <View>
        <MapView
          style={stylesMap.map}
          ref={(ref) => { this.mapRef = ref }}
          onLayout = {() => this.mapRef.fitToCoordinates(this.state.summary_polyline, { edgePadding: { top: 10, right: 10, bottom: 10, left: 10 }, animated: true })}
          customMapStyle={mapStyle}>
        <Polyline
          coordinates={this.state.summary_polyline}
          strokeWidth={3}
          strokeColor="#F00"
        />
        </MapView>
      </View>
    );
  }

}

 class Details extends React.Component {

  constructor(props){
    super(props);
    this.state ={ isLoading: true,
                  results: {},
                  name: "",
                  distance: "",
                }
  }

  componentDidMount(){
      const { navigation } = this.props;
      const activityid = navigation.getParam('id', 'NO-ID');

      let moment = require('moment');
      let convert = require('convert-units');

      Mura.init(
        env
      );

      const thisWeekStartDate = moment().startOf('isoWeek').format('YYYY-MM-DD');


      results = Mura.getEntity('activity').loadBy('id',activityid)
      .then((results) => {
        console.log(results.getAll());
        //console.log(results.get('map'));
        this.setState({
          isLoading: false,
          activityId: activityid,
          type: results.get('type'),
          name: results.get('name'),
          distance: convert(results.get('distance')).from('m').to('mi').toFixed(2),
          elapsed_time: moment().startOf('day').seconds(results.get('elapsed_time')).format('HH:mm:ss'),
          moving_time: moment().startOf('day').seconds(results.get('moving_time')).format('HH:mm:ss'),
          total_elevation_gain: convert(results.get('total_elevation_gain')).from('m').to('ft').toFixed(2),
          pace: convert(results.get('distance')).from('m').to('mi').toFixed(2) / moment().startOf('day').seconds(results.get('moving_time')),
          mapId: results.get('map'),
        }, function(){

        });

      }).catch((error) =>{
        console.error(error);
      });
      };

  render() {



    if(this.state.isLoading){
      return(
        <View style={{flex: 1, padding: 60}}>
          <ActivityIndicator/>
        </View>
      )
    }
    return (
      <Container style={styles.container}>
        <Header style={styles.header}>
          <Left>
            <Button transparent onPress={() => this.props.navigation.openDrawer()}>
              <Icon name='menu' />
            </Button>
          </Left>
          <Body>
            <Title>{this.state.type}</Title>
          </Body>
          <Right />
        </Header>
        <Content padder>
         <View style={{ flex: 1 }}>
           <View style={{flex:1}}>
             <ActivityMap activityMapId={this.state.activityId} />
           </View>
           <View style={{flex: 2}}>
             <Text>{this.state.name}</Text>
             <Text>Distance: {this.state.distance} mi.</Text>
             <Text>Total Time: {this.state.elapsed_time}</Text>
             <Text>Moving Time: {this.state.moving_time}</Text>
             <Text>Pace: {this.state.pace}</Text>
             <Text>Total Elevation Gain: {this.state.total_elevation_gain}</Text>
           </View>
         </View>
       </Content>
      </Container>
    );
  }

}

const stylesMap = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    flex: 1,
    width,
    height: 300
  },
});

export default Details;
