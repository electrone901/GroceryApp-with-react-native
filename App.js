/**
THIS TUTORIAL WORKED https://firebase.googleblog.com/2016/01/the-beginners-guide-to-react-native-and_84.html FOR THISPROJECT
 */
'use strict';
import React, {Component} from 'react';
import ReactNative from 'react-native';
const firebase = require('firebase');
const StatusBar = require('./components/StatusBar');
const ActionButton = require('./components/ActionButton');
const ListItem = require('./components/ListItem');
const styles = require('./styles.js')

const {
  AppRegistry,
  ListView,
  Text,
  View,
  TouchableHighlight,
  AlertIOS,
} = ReactNative;


// Initialize Firebase
const firebaseConfig = {



  // IT'S WORKING FOR TEST database, just add your firebase configuration  
  apiKey: "<your-api-key>",
  authDomain: "<your-auth-domain>",
  databaseURL: "<your-database-url>",
  storageBucket: "<your-storage-bucket>",
};



const firebaseApp = firebase.initializeApp(firebaseConfig);


// App contains the entire app
export default class App extends Component<{}> {
  constructor(props) {
    super(props);
  {/*the app’s state is a ListView.DataSource is a class that provides efficient data processing to a ListView component*/}
    this.state = {
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      })
    };
    // creates db reference as a property in the constructor
    this.itemsRef = this.getRef().child('items');
  }

  getRef() {
    return firebaseApp.database().ref();
  }



  // Whenever an item is added/changed/removed,the entire result set back as a DataSnapshot of firebase then forEach(child),  iterates through all of the children and adds them to an array as a grocery list item.Then dataSource is updated The cloneWithRows()is  a convenience method for creating a new ListView.

  listenForItems(itemsRef) {
    itemsRef.on('value', (snap) => {
      // get children as an array
      var items = [];
      snap.forEach((child) => {
        items.push({
          title: child.val().title,
          _key: child.key
        });
      });

      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(items)
      });

    });
  }


  // When App component has first been rendered, componentDidMount() is called to set.State & it will  re-render the app.
  componentDidMount() {
    this.listenForItems(this.itemsRef);
  }

  // main view of the app, 
  render() {
    return (
      <View style={styles.container}>

        <StatusBar title="Grocery List" />

        {/*ListView displays the list of grocery items */}
        <ListView
          dataSource={this.state.dataSource}
          renderRow={this._renderItem.bind(this)}
          enableEmptySections={true}
          style={styles.listview}/>

        <ActionButton onPress={this._addItem.bind(this)} title="Add" />

      </View>
    )
  }

  // ADD NEW ITEMS TO OUR APP VIA AlertIOS WITH TITLE, CANCEL AND ADD OPTION. AlertIOS:the first two parameters are title and an optional message. Third parameter is an array that specifies buttons available to the user. Each button can have a text, style, and an onPress callback function. Last parameter is type the of input, whether plain-text or secure-text.
  
  // To add an item, create an object in the buttons array. This object can add items in the onPress callback. The callback returns the text the user has entered. Use this text to .push() a new child onto the /items location
  // text is the user input
  _addItem() {
    AlertIOS.prompt(
      'Add New Item',
      null,
      [
        {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {
          text: 'Add',
          onPress: (text) => {
            this.itemsRef.push({ title: text })
          }
        },
      ],
      'plain-text'
    );
  }

  // sets the individual items in the list. To "complete" an item we need to delete it from db. Using .child(key), we can drill down into a specific item in the list. The onPress callback is a closure, therefore it has access to the outer environment which contains the item parameter. This is where the _key property comes in hand.

// When the "Complete" option is tapped, you can find the specific child by using the _key property on item. Then you can call .remove() to delete the item in the Firebase database. 
  _renderItem(item) {
    console.log('item:',item)
    const onPress = () => {
      AlertIOS.alert(
        'Complete',
        null,
        [
          {text: 'Complete', onPress: (text) => {
            this.itemsRef.child(item._key).remove()
            console.log('remove!!')}
          },
          {text: 'Cancel', onPress: (text) => console.log('Cancelled')}
        ]
      );
    };
  {/*Tap any ListItem , tap "Complete", and you should see it removed from the list.*/}
    return (
      <ListItem item={item} onPress={onPress} />
    );
  }


}
