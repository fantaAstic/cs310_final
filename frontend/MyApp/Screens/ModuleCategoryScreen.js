/**
 * @fileoverview Module Category Screen Component.
 * Displays detailed insights for a specific topic within a module,
 * including summary, statistics, and analysis plots (emotion/sentiment timeseries).
 * Allows users to toggle between summary and analysis views, and zoom into images.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Image,
  Appearance,
  Dimensions,
  Button,
  Modal,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { getTopicsByModule } from '../api/apiService'; // API function to fetch TopicsByModule
import { useUser } from '../UserContext'; 
import ImageViewer from 'react-native-image-zoom-viewer';
import Icon from 'react-native-vector-icons/FontAwesome';
import ImageZoom from 'react-native-image-pan-zoom';

const ZoomableImage = ({ imageSource }) => {
  const [zoomVisible, setZoomVisible] = useState(false);

  const handleOpenZoom = () => {
    setZoomVisible(true); // Show the zoom modal
  };

  const handleCloseZoom = () => {
    setZoomVisible(false); // Close the zoom modal
  };

  // Get the screen dimensions
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  return (
    <>
      {/* Zoom Button */}
      <Button title="View Zoomed Image" onPress={handleOpenZoom} />
      {/* Image Display */}
      <Image
        source={imageSource}
        style={styles.analysisImage}
        resizeMode="contain"
        onLoad={() => console.log('Image is displayed')}
      />

      {/* Modal with Image Viewer */}
      <Modal visible={zoomVisible} transparent={true}>
        <View style={styles.modalContainer}>
          <ImageZoom
            cropWidth={screenWidth} // Set crop width to screen width
            cropHeight={screenHeight} // Set crop height to screen height
            imageWidth={screenWidth} // Set image width to screen width
            imageHeight={screenHeight} // Set image height to screen height
          >
            <Image
              source={imageSource}
              style={{ width: screenWidth, height: screenHeight }} // Make image fill the screen
              resizeMode="contain"
            />
          </ImageZoom>
          <View style={styles.closeButtonContainer}>
            <Button title="Close" onPress={handleCloseZoom} />
          </View>
        </View>
      </Modal>
    </>
  );
};

const ModuleCategoryScreen = ({ navigation }) => {
  const [darkMode, setDarkMode] = useState(Appearance.getColorScheme() === 'dark');
  const [activeTab, setActiveTab] = useState('Summary'); 
  const [categoryData, setCategoryData] = useState(null);

  const { user, setUser } = useUser();
  const route = useRoute();
  const { topic, moduleName } = route.params; // Get the topic and module name

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const allTopics = await getTopicsByModule(moduleName, topic);
        console.log('API Response:', allTopics); // Log the full response
  
        const matchingTopic = allTopics
        console.log('Matching Entry:', matchingTopic);
  
        setCategoryData(matchingTopic || {});
      } catch (error) {
        console.error('Error fetching category data:', error);
      }
    };
  
    fetchCategoryData(); // Call the function here!
  }, [topic, moduleName]);   
  
  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const imageMapping = {
    'Computational-Thinking-for-Problem-Solving_Exams': {
      emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Computational-Thinking-for-Problem-Solving_Exams.png'),
      sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Computational-Thinking-for-Problem-Solving_Exams.png'),
    },
    'Computational-Thinking-for-Problem-Solving_Workload': {
      emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Computational-Thinking-for-Problem-Solving_Workload.png'),
      sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Computational-Thinking-for-Problem-Solving_Workload.png'),
    },
    'Computational-Thinking-for-Problem-Solving_Assignments': {
      emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Computational-Thinking-for-Problem-Solving_Assignments.png'),
      sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Computational-Thinking-for-Problem-Solving_Assignments.png'),
    },
    'Computational-Thinking-for-Problem-Solving_Lectures': {
      emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Computational-Thinking-for-Problem-Solving_Lectures.png'),
      sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Computational-Thinking-for-Problem-Solving_Lectures.png'),
    },
    'Computational-Thinking-for-Problem-Solving_Grading': {
      emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Computational-Thinking-for-Problem-Solving_Grading.png'),
      sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Computational-Thinking-for-Problem-Solving_Grading.png'),
    },
    'Computational-Thinking-for-Problem-Solving_Course-Engagement-and-Course-FeelingsSentiment': {
      emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Computational-Thinking-for-Problem-Solving_Course-Engagement-and-Course-FeelingsSentiment.png'),
      sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Computational-Thinking-for-Problem-Solving_Course-Engagement-and-Course-FeelingsSentiment.png'),
    },
    'Computational-Thinking-for-Problem-Solving_Course-Structure': {
      emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Computational-Thinking-for-Problem-Solving_Course-Structure.png'),
      sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Computational-Thinking-for-Problem-Solving_Course-Structure.png'),
    },
    'Computational-Thinking-for-Problem-Solving_Utility-and-Usefulness': {
      emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Computational-Thinking-for-Problem-Solving_Utility-and-Usefulness.png'),
      sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Computational-Thinking-for-Problem-Solving_Utility-and-Usefulness.png'),
    },
    'Computational-Thinking-for-Problem-Solving_Learning-Outcomes': {
      emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Computational-Thinking-for-Problem-Solving_Learning-Outcomes.png'),
      sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Computational-Thinking-for-Problem-Solving_Learning-Outcomes.png'),
    },
    'Computational-Thinking-for-Problem-Solving_Course-Material-and-Understanding': {
      emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Computational-Thinking-for-Problem-Solving_Course-Material-and-Understanding.png'),
      sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Computational-Thinking-for-Problem-Solving_Course-Material-and-Understanding.png'),
    },
    'Computational-Thinking-for-Problem-Solving_Instructor': {
      emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Computational-Thinking-for-Problem-Solving_Instructor.png'),
      sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Computational-Thinking-for-Problem-Solving_Instructor.png'),
    },
    'Computational-Thinking-for-Problem-Solving_Course-Material': {
      emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Computational-Thinking-for-Problem-Solving_Course-Material.png'),
      sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Computational-Thinking-for-Problem-Solving_Course-Material.png'),
    },
    
    'Machine-Learning_Exams': {
      emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Machine-Learning_Exams.png'),
      sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Machine-Learning_Exams.png'),
    },
    'Machine-Learning_Workload': {
      emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Machine-Learning_Workload.png'),
      sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Machine-Learning_Workload.png'),
    },
    'Machine-Learning_Assignments': {
      emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Machine-Learning_Assignments.png'),
      sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Machine-Learning_Assignments.png'),
    },
    'Machine-Learning_Lectures': {
      emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Machine-Learning_Lectures.png'),
      sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Machine-Learning_Lectures.png'),
    },
    'Machine-Learning_Grading': {
      emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Machine-Learning_Grading.png'),
      sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Machine-Learning_Grading.png'),
    },
    'Machine-Learning_Course-Engagement-and-Course-Feelings-Sentiment': {
      emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Machine-Learning_Course-Engagement-and-Course-FeelingsSentiment.png'),
      sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Machine-Learning_Course-Engagement-and-Course-FeelingsSentiment.png'),
    },
    'Machine-Learning_Course-Structure': {
      emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Machine-Learning_Course-Structure.png'),
      sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Machine-Learning_Course-Structure.png'),
    },
    'Machine-Learning_Utility-and-Usefulness': {
      emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Machine-Learning_Utility-and-Usefulness.png'),
      sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Machine-Learning_Utility-and-Usefulness.png'),
    },
    'Machine-Learning_Learning-Outcomes': {
      emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Machine-Learning_Learning-Outcomes.png'),
      sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Machine-Learning_Learning-Outcomes.png'),
    },
    'Machine-Learning_Course-Material-and-Understanding': {
      emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Machine-Learning_Course-Material-and-Understanding.png'),
      sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Machine-Learning_Course-Material-and-Understanding.png'),
    },
    'Machine-Learning_Instructor': {
      emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Machine-Learning_Instructor.png'),
      sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Machine-Learning_Instructor.png'),
    },
    'Machine-Learning_Course-Material': {
      emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Machine-Learning_Course-Material.png'),
      sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Machine-Learning_Course-Material.png'),
    },
    'Programming-for-Everybody-Getting-Started-with-Python_Exams': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Programming-for-Everybody-Getting-Started-with-Python_Exams.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Programming-for-Everybody-Getting-Started-with-Python_Exams.png'),
  },
  'Programming-for-Everybody-Getting-Started-with-Python_Workload': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Programming-for-Everybody-Getting-Started-with-Python_Workload.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Programming-for-Everybody-Getting-Started-with-Python_Workload.png'),
  },
  'Programming-for-Everybody-Getting-Started-with-Python_Assignments': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Programming-for-Everybody-Getting-Started-with-Python_Assignments.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Programming-for-Everybody-Getting-Started-with-Python_Assignments.png'),
  },
  'Programming-for-Everybody-Getting-Started-with-Python_Lectures': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Programming-for-Everybody-Getting-Started-with-Python_Lectures.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Programming-for-Everybody-Getting-Started-with-Python_Lectures.png'),
  },
  'Programming-for-Everybody-Getting-Started-with-Python_Grading': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Programming-for-Everybody-Getting-Started-with-Python_Grading.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Programming-for-Everybody-Getting-Started-with-Python_Grading.png'),
  },
  'Programming-for-Everybody-Getting-Started-with-Python_Course-Engagement-and-Course-FeelingsSentiment': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Programming-for-Everybody-Getting-Started-with-Python_Course-Engagement-and-Course-FeelingsSentiment.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Programming-for-Everybody-Getting-Started-with-Python_Course-Engagement-and-Course-FeelingsSentiment.png'),
  },
  'Programming-for-Everybody-Getting-Started-with-Python_Course-Structure': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Programming-for-Everybody-Getting-Started-with-Python_Course-Structure.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Programming-for-Everybody-Getting-Started-with-Python_Course-Structure.png'),
  },
  'Programming-for-Everybody-Getting-Started-with-Python_Utility-and-Usefulness': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Programming-for-Everybody-Getting-Started-with-Python_Utility-and-Usefulness.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Programming-for-Everybody-Getting-Started-with-Python_Utility-and-Usefulness.png'),
  },
  'Programming-for-Everybody-Getting-Started-with-Python_Learning-Outcomes': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Programming-for-Everybody-Getting-Started-with-Python_Learning-Outcomes.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Programming-for-Everybody-Getting-Started-with-Python_Learning-Outcomes.png'),
  },
  'Programming-for-Everybody-Getting-Started-with-Python_Course-Material-and-Understanding': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Programming-for-Everybody-Getting-Started-with-Python_Course-Material-and-Understanding.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Programming-for-Everybody-Getting-Started-with-Python_Course-Material-and-Understanding.png'),
  },
  'Programming-for-Everybody-Getting-Started-with-Python_Instructor': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Programming-for-Everybody-Getting-Started-with-Python_Instructor.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Programming-for-Everybody-Getting-Started-with-Python_Instructor.png'),
  },
  'Programming-for-Everybody-Getting-Started-with-Python_Course-Material': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Programming-for-Everybody-Getting-Started-with-Python_Course-Material.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Programming-for-Everybody-Getting-Started-with-Python_Course-Material.png'),
  },
  
  'Programming-Languages-Part-A_Exams': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Programming-Languages-Part-A_Exams.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Programming-Languages-Part-A_Exams.png'),
  },
  'Programming-Languages-Part-A_Workload': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Programming-Languages-Part-A_Workload.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Programming-Languages-Part-A_Workload.png'),
  },
  'Programming-Languages-Part-A_Assignments': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Programming-Languages-Part-A_Assignments.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Programming-Languages-Part-A_Assignments.png'),
  },
  'Programming-Languages-Part-A_Lectures': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Programming-Languages-Part-A_Lectures.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Programming-Languages-Part-A_Lectures.png'),
  },
  'Programming-Languages-Part-A_Grading': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Programming-Languages-Part-A_Grading.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Programming-Languages-Part-A_Grading.png'),
  },
  'Programming-Languages-Part-A_Course-Engagement-and-Course-FeelingsSentiment': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Programming-Languages-Part-A_Course-Engagement-and-Course-FeelingsSentiment.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Programming-Languages-Part-A_Course-Engagement-and-Course-FeelingsSentiment.png'),
  },
  'Programming-Languages-Part-A_Course-Structure': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Programming-Languages-Part-A_Course-Structure.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Programming-Languages-Part-A_Course-Structure.png'),
  },
  'Programming-Languages-Part-A_Utility-and-Usefulness': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Programming-Languages-Part-A_Utility-and-Usefulness.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Programming-Languages-Part-A_Utility-and-Usefulness.png'),
  },
  'Programming-Languages-Part-A_Learning-Outcomes': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Programming-Languages-Part-A_Learning-Outcomes.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Programming-Languages-Part-A_Learning-Outcomes.png'),
  },
  'Programming-Languages-Part-A_Course-Material-and-Understanding': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Programming-Languages-Part-A_Course-Material-and-Understanding.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Programming-Languages-Part-A_Course-Material-and-Understanding.png'),
  },
  'Programming-Languages-Part-A_Instructor': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Programming-Languages-Part-A_Instructor.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Programming-Languages-Part-A_Instructor.png'),
  },
  'Programming-Languages-Part-A_Course-Material': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Programming-Languages-Part-A_Course-Material.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Programming-Languages-Part-A_Course-Material.png'),
  },
  'The-Data-Scientists-Toolbox_Exams': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_The-Data-Scientists-Toolbox_Exams.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_The-Data-Scientists-Toolbox_Exams.png'),
  },
  'The-Data-Scientists-Toolbox_Workload': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_The-Data-Scientists-Toolbox_Workload.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_The-Data-Scientists-Toolbox_Workload.png'),
  },
  'The-Data-Scientists-Toolbox_Assignments': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_The-Data-Scientists-Toolbox_Assignments.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_The-Data-Scientists-Toolbox_Assignments.png'),
  },
  'The-Data-Scientists-Toolbox_Lectures': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_The-Data-Scientists-Toolbox_Lectures.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_The-Data-Scientists-Toolbox_Lectures.png'),
  },
  'The-Data-Scientists-Toolbox_Grading': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_The-Data-Scientists-Toolbox_Grading.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_The-Data-Scientists-Toolbox_Grading.png'),
  },
  'The-Data-Scientists-Toolbox_Course-Engagement-and-Course-FeelingsSentiment': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_The-Data-Scientists-Toolbox_Course-Engagement-and-Course-FeelingsSentiment.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_The-Data-Scientists-Toolbox_Course-Engagement-and-Course-FeelingsSentiment.png'),
  },
  'The-Data-Scientists-Toolbox_Course-Structure': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_The-Data-Scientists-Toolbox_Course-Structure.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_The-Data-Scientists-Toolbox_Course-Structure.png'),
  },
  'The-Data-Scientists-Toolbox_Utility-and-Usefulness': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_The-Data-Scientists-Toolbox_Utility-and-Usefulness.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_The-Data-Scientists-Toolbox_Utility-and-Usefulness.png'),
  },
  'The-Data-Scientists-Toolbox_Learning-Outcomes': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_The-Data-Scientists-Toolbox_Learning-Outcomes.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_The-Data-Scientists-Toolbox_Learning-Outcomes.png'),
  },
  'The-Data-Scientists-Toolbox_Course-Material-and-Understanding': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_The-Data-Scientists-Toolbox_Course-Material-and-Understanding.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_The-Data-Scientists-Toolbox_Course-Material-and-Understanding.png'),
  },
  'The-Data-Scientists-Toolbox_Instructor': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_The-Data-Scientists-Toolbox_Instructor.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_The-Data-Scientists-Toolbox_Instructor.png'),
  },
  'The-Data-Scientists-Toolbox_Course-Material': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_The-Data-Scientists-Toolbox_Course-Material.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_The-Data-Scientists-Toolbox_Course-Material.png'),
  },

  'Using-Databases-with-Python_Exams': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Using-Databases-with-Python_Exams.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Using-Databases-with-Python_Exams.png'),
  },
  'Using-Databases-with-Python_Workload': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Using-Databases-with-Python_Workload.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Using-Databases-with-Python_Workload.png'),
  },
  'Using-Databases-with-Python_Assignments': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Using-Databases-with-Python_Assignments.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Using-Databases-with-Python_Assignments.png'),
  },
  'Using-Databases-with-Python_Lectures': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Using-Databases-with-Python_Lectures.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Using-Databases-with-Python_Lectures.png'),
  },
  'Using-Databases-with-Python_Grading': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Using-Databases-with-Python_Grading.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Using-Databases-with-Python_Grading.png'),
  },
  'Using-Databases-with-Python_Course-Engagement-and-Course-FeelingsSentiment': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Using-Databases-with-Python_Course-Engagement-and-Course-FeelingsSentiment.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Using-Databases-with-Python_Course-Engagement-and-Course-FeelingsSentiment.png'),
  },
  'Using-Databases-with-Python_Course-Structure': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Using-Databases-with-Python_Course-Structure.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Using-Databases-with-Python_Course-Structure.png'),
  },
  'Using-Databases-with-Python_Utility-and-Usefulness': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Using-Databases-with-Python_Utility-and-Usefulness.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Using-Databases-with-Python_Utility-and-Usefulness.png'),
  },
  'Using-Databases-with-Python_Learning-Outcomes': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Using-Databases-with-Python_Learning-Outcomes.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Using-Databases-with-Python_Learning-Outcomes.png'),
  },
  'Using-Databases-with-Python_Course-Material-and-Understanding': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Using-Databases-with-Python_Course-Material-and-Understanding.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Using-Databases-with-Python_Course-Material-and-Understanding.png'),
  },
  'Using-Databases-with-Python_Instructor': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Using-Databases-with-Python_Instructor.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Using-Databases-with-Python_Instructor.png'),
  },
  'Using-Databases-with-Python_Course-Material': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Using-Databases-with-Python_Course-Material.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Using-Databases-with-Python_Course-Material.png'),
  },

  'Using-Python-to-Access-Web-Data_Exams': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Using-Python-to-Access-Web-Data_Exams.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Using-Python-to-Access-Web-Data_Exams.png'),
  },
  'Using-Python-to-Access-Web-Data_Workload': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Using-Python-to-Access-Web-Data_Workload.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Using-Python-to-Access-Web-Data_Workload.png'),
  },
  'Using-Python-to-Access-Web-Data_Assignments': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Using-Python-to-Access-Web-Data_Assignments.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Using-Python-to-Access-Web-Data_Assignments.png'),
  },
  'Using-Python-to-Access-Web-Data_Lectures': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Using-Python-to-Access-Web-Data_Lectures.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Using-Python-to-Access-Web-Data_Lectures.png'),
  },
  'Using-Python-to-Access-Web-Data_Grading': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Using-Python-to-Access-Web-Data_Grading.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Using-Python-to-Access-Web-Data_Grading.png'),
  },
  'Using-Python-to-Access-Web-Data_Course-Engagement-and-Course-FeelingsSentiment': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Using-Python-to-Access-Web-Data_Course-Engagement-and-Course-FeelingsSentiment.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Using-Python-to-Access-Web-Data_Course-Engagement-and-Course-FeelingsSentiment.png'),
  },
  'Using-Python-to-Access-Web-Data_Course-Structure': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Using-Python-to-Access-Web-Data_Course-Structure.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Using-Python-to-Access-Web-Data_Course-Structure.png'),
  },
  'Using-Python-to-Access-Web-Data_Utility-and-Usefulness': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Using-Python-to-Access-Web-Data_Utility-and-Usefulness.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Using-Python-to-Access-Web-Data_Utility-and-Usefulness.png'),
  },
  'Using-Python-to-Access-Web-Data_Learning-Outcomes': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Using-Python-to-Access-Web-Data_Learning-Outcomes.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Using-Python-to-Access-Web-Data_Learning-Outcomes.png'),
  },
  'Using-Python-to-Access-Web-Data_Course-Material-and-Understanding': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Using-Python-to-Access-Web-Data_Course-Material-and-Understanding.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Using-Python-to-Access-Web-Data_Course-Material-and-Understanding.png'),
  },
  'Using-Python-to-Access-Web-Data_Instructor': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Using-Python-to-Access-Web-Data_Instructor.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Using-Python-to-Access-Web-Data_Instructor.png'),
  },
  'Using-Python-to-Access-Web-Data_Course-Material': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Using-Python-to-Access-Web-Data_Course-Material.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Using-Python-to-Access-Web-Data_Course-Material.png'),
  }, 
  'Introduction-to-Data-Science-in-Python_Exams': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Introduction-to-Data-Science-in-Python_Exams.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Introduction-to-Data-Science-in-Python_Exams.png'),
  },
  'Introduction-to-Data-Science-in-Python_Workload': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Introduction-to-Data-Science-in-Python_Workload.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Introduction-to-Data-Science-in-Python_Workload.png'),
  },
  'Introduction-to-Data-Science-in-Python_Assignments': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Introduction-to-Data-Science-in-Python_Assignments.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Introduction-to-Data-Science-in-Python_Assignments.png'),
  },
  'Introduction-to-Data-Science-in-Python_Lectures': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Introduction-to-Data-Science-in-Python_Lectures.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Introduction-to-Data-Science-in-Python_Lectures.png'),
  },
  'Introduction-to-Data-Science-in-Python_Grading': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Introduction-to-Data-Science-in-Python_Grading.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Introduction-to-Data-Science-in-Python_Grading.png'),
  },
  'Introduction-to-Data-Science-in-Python_Course-Engagement-and-Course-FeelingsSentiment': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Introduction-to-Data-Science-in-Python_Course-Engagement-and-Course-FeelingsSentiment.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Introduction-to-Data-Science-in-Python_Course-Engagement-and-Course-FeelingsSentiment.png'),
  },
  'Introduction-to-Data-Science-in-Python_Course-Structure': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Introduction-to-Data-Science-in-Python_Course-Structure.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Introduction-to-Data-Science-in-Python_Course-Structure.png'),
  },
  'Introduction-to-Data-Science-in-Python_Utility-and-Usefulness': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Introduction-to-Data-Science-in-Python_Utility-and-Usefulness.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Introduction-to-Data-Science-in-Python_Utility-and-Usefulness.png'),
  },
  'Introduction-to-Data-Science-in-Python_Learning-Outcomes': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Introduction-to-Data-Science-in-Python_Learning-Outcomes.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Introduction-to-Data-Science-in-Python_Learning-Outcomes.png'),
  },
  'Introduction-to-Data-Science-in-Python_Course-Material-and-Understanding': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Introduction-to-Data-Science-in-Python_Course-Material-and-Understanding.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Introduction-to-Data-Science-in-Python_Course-Material-and-Understanding.png'),
  },
  'Introduction-to-Data-Science-in-Python_Instructor': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Introduction-to-Data-Science-in-Python_Instructor.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Introduction-to-Data-Science-in-Python_Instructor.png'),
  },
  'Introduction-to-Data-Science-in-Python_Course-Material': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Introduction-to-Data-Science-in-Python_Course-Material.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Introduction-to-Data-Science-in-Python_Course-Material.png'),
  },
  'Python-Basics_Exams': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-Basics_Exams.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-Basics_Exams.png'),
  },
  'Python-Basics_Workload': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-Basics_Workload.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-Basics_Workload.png'),
  },
  'Python-Basics_Assignments': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-Basics_Assignments.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-Basics_Assignments.png'),
  },
  'Python-Basics_Lectures': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-Basics_Lectures.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-Basics_Lectures.png'),
  },
  'Python-Basics_Grading': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-Basics_Grading.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-Basics_Grading.png'),
  },
  'Python-Basics_Course-Engagement-and-Course-FeelingsSentiment': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-Basics_Course-Engagement-and-Course-FeelingsSentiment.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-Basics_Course-Engagement-and-Course-FeelingsSentiment.png'),
  },
  'Python-Basics_Course-Structure': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-Basics_Course-Structure.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-Basics_Course-Structure.png'),
  },
  'Python-Basics_Utility-and-Usefulness': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-Basics_Utility-and-Usefulness.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-Basics_Utility-and-Usefulness.png'),
  },
  'Python-Basics_Learning-Outcomes': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-Basics_Learning-Outcomes.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-Basics_Learning-Outcomes.png'),
  },
  'Python-Basics_Course-Material-and-Understanding': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-Basics_Course-Material-and-Understanding.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-Basics_Course-Material-and-Understanding.png'),
  },
  'Python-Basics_Instructor': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-Basics_Instructor.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-Basics_Instructor.png'),
  },
  'Python-Basics_Course-Material': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-Basics_Course-Material.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-Basics_Course-Material.png'),
  },

  // Algorithmic Toolbox
  'Algorithmic-Toolbox_Exams': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Algorithmic-Toolbox_Exams.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Algorithmic-Toolbox_Exams.png'),
  },
  'Algorithmic-Toolbox_Workload': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Algorithmic-Toolbox_Workload.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Algorithmic-Toolbox_Workload.png'),
  },
  'Algorithmic-Toolbox_Assignments': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Algorithmic-Toolbox_Assignments.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Algorithmic-Toolbox_Assignments.png'),
  },
  'Algorithmic-Toolbox_Lectures': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Algorithmic-Toolbox_Lectures.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Algorithmic-Toolbox_Lectures.png'),
  },
  'Algorithmic-Toolbox_Grading': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Algorithmic-Toolbox_Grading.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Algorithmic-Toolbox_Grading.png'),
  },
  'Algorithmic-Toolbox_Course-Engagement-and-Course-FeelingsSentiment': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Algorithmic-Toolbox_Course-Engagement-and-Course-FeelingsSentiment.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Algorithmic-Toolbox_Course-Engagement-and-Course-FeelingsSentiment.png'),
  },
  'Algorithmic-Toolbox_Course-Structure': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Algorithmic-Toolbox_Course-Structure.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Algorithmic-Toolbox_Course-Structure.png'),
  },
  'Algorithmic-Toolbox_Utility-and-Usefulness': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Algorithmic-Toolbox_Utility-and-Usefulness.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Algorithmic-Toolbox_Utility-and-Usefulness.png'),
  },
  'Algorithmic-Toolbox_Learning-Outcomes': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Algorithmic-Toolbox_Learning-Outcomes.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Algorithmic-Toolbox_Learning-Outcomes.png'),
  },
  'Algorithmic-Toolbox_Course-Material-and-Understanding': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Algorithmic-Toolbox_Course-Material-and-Understanding.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Algorithmic-Toolbox_Course-Material-and-Understanding.png'),
  },
  'Algorithmic-Toolbox_Instructor': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Algorithmic-Toolbox_Instructor.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Algorithmic-Toolbox_Instructor.png'),
  },
  'Algorithmic-Toolbox_Course-Material': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Algorithmic-Toolbox_Course-Material.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Algorithmic-Toolbox_Course-Material.png'),
  },
  'Information-Security-Context-and-Introduction_Exams': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Information-Security-Context-and-Introduction_Exams.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Information-Security-Context-and-Introduction_Exams.png'),
  },
  'Information-Security-Context-and-Introduction_Workload': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Information-Security-Context-and-Introduction_Workload.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Information-Security-Context-and-Introduction_Workload.png'),
  },
  'Information-Security-Context-and-Introduction_Assignments': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Information-Security-Context-and-Introduction_Assignments.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Information-Security-Context-and-Introduction_Assignments.png'),
  },
  'Information-Security-Context-and-Introduction_Lectures': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Information-Security-Context-and-Introduction_Lectures.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Information-Security-Context-and-Introduction_Lectures.png'),
  },
  'Information-Security-Context-and-Introduction_Grading': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Information-Security-Context-and-Introduction_Grading.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Information-Security-Context-and-Introduction_Grading.png'),
  },
  'Information-Security-Context-and-Introduction_Course-Engagement-and-Course-FeelingsSentiment': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Information-Security-Context-and-Introduction_Course-Engagement-and-Course-FeelingsSentiment.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Information-Security-Context-and-Introduction_Course-Engagement-and-Course-FeelingsSentiment.png'),
  },
  'Information-Security-Context-and-Introduction_Course-Structure': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Information-Security-Context-and-Introduction_Course-Structure.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Information-Security-Context-and-Introduction_Course-Structure.png'),
  },
  'Information-Security-Context-and-Introduction_Utility-and-Usefulness': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Information-Security-Context-and-Introduction_Utility-and-Usefulness.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Information-Security-Context-and-Introduction_Utility-and-Usefulness.png'),
  },
  'Information-Security-Context-and-Introduction_Learning-Outcomes': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Information-Security-Context-and-Introduction_Learning-Outcomes.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Information-Security-Context-and-Introduction_Learning-Outcomes.png'),
  },
  'Information-Security-Context-and-Introduction_Course-Material-and-Understanding': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Information-Security-Context-and-Introduction_Course-Material-and-Understanding.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Information-Security-Context-and-Introduction_Course-Material-and-Understanding.png'),
  },
  'Information-Security-Context-and-Introduction_Instructor': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Information-Security-Context-and-Introduction_Instructor.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Information-Security-Context-and-Introduction_Instructor.png'),
  },
  'Information-Security-Context-and-Introduction_Course-Material': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Information-Security-Context-and-Introduction_Course-Material.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Information-Security-Context-and-Introduction_Course-Material.png'),
  },
  'SQL-for-Data-Science_Exams': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_SQL-for-Data-Science_Exams.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_SQL-for-Data-Science_Exams.png'),
  },
  'SQL-for-Data-Science_Workload': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_SQL-for-Data-Science_Workload.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_SQL-for-Data-Science_Workload.png'),
  },
  'SQL-for-Data-Science_Assignments': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_SQL-for-Data-Science_Assignments.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_SQL-for-Data-Science_Assignments.png'),
  },
  'SQL-for-Data-Science_Lectures': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_SQL-for-Data-Science_Lectures.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_SQL-for-Data-Science_Lectures.png'),
  },
  'SQL-for-Data-Science_Grading': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_SQL-for-Data-Science_Grading.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_SQL-for-Data-Science_Grading.png'),
  },
  'SQL-for-Data-Science_Course-Engagement-and-Course-FeelingsSentiment': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_SQL-for-Data-Science_Course-Engagement-and-Course-FeelingsSentiment.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_SQL-for-Data-Science_Course-Engagement-and-Course-FeelingsSentiment.png'),
  },
  'SQL-for-Data-Science_Course-Structure': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_SQL-for-Data-Science_Course-Structure.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_SQL-for-Data-Science_Course-Structure.png'),
  },
  'SQL-for-Data-Science_Utility-and-Usefulness': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_SQL-for-Data-Science_Utility-and-Usefulness.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_SQL-for-Data-Science_Utility-and-Usefulness.png'),
  },
  'SQL-for-Data-Science_Learning-Outcomes': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_SQL-for-Data-Science_Learning-Outcomes.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_SQL-for-Data-Science_Learning-Outcomes.png'),
  },
  'SQL-for-Data-Science_Course-Material-and-Understanding': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_SQL-for-Data-Science_Course-Material-and-Understanding.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_SQL-for-Data-Science_Course-Material-and-Understanding.png'),
  },
  'SQL-for-Data-Science_Instructor': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_SQL-for-Data-Science_Instructor.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_SQL-for-Data-Science_Instructor.png'),
  },
  'SQL-for-Data-Science_Course-Material': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_SQL-for-Data-Science_Course-Material.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_SQL-for-Data-Science_Course-Material.png'),
  },
  'Fundamentals-of-Visualization-with-Tableau_Exams': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Fundamentals-of-Visualization-with-Tableau_Exams.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Fundamentals-of-Visualization-with-Tableau_Exams.png'),
  },
  'Fundamentals-of-Visualization-with-Tableau_Workload': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Fundamentals-of-Visualization-with-Tableau_Workload.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Fundamentals-of-Visualization-with-Tableau_Workload.png'),
  },
  'Fundamentals-of-Visualization-with-Tableau_Assignments': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Fundamentals-of-Visualization-with-Tableau_Assignments.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Fundamentals-of-Visualization-with-Tableau_Assignments.png'),
  },
  'Fundamentals-of-Visualization-with-Tableau_Lectures': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Fundamentals-of-Visualization-with-Tableau_Lectures.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Fundamentals-of-Visualization-with-Tableau_Lectures.png'),
  },
  'Fundamentals-of-Visualization-with-Tableau_Grading': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Fundamentals-of-Visualization-with-Tableau_Grading.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Fundamentals-of-Visualization-with-Tableau_Grading.png'),
  },
  'Fundamentals-of-Visualization-with-Tableau_Course-Engagement-and-Course-FeelingsSentiment': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Fundamentals-of-Visualization-with-Tableau_Course-Engagement-and-Course-FeelingsSentiment.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Fundamentals-of-Visualization-with-Tableau_Course-Engagement-and-Course-FeelingsSentiment.png'),
  },
  'Fundamentals-of-Visualization-with-Tableau_Course-Structure': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Fundamentals-of-Visualization-with-Tableau_Course-Structure.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Fundamentals-of-Visualization-with-Tableau_Course-Structure.png'),
  },
  'Fundamentals-of-Visualization-with-Tableau_Utility-and-Usefulness': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Fundamentals-of-Visualization-with-Tableau_Utility-and-Usefulness.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Fundamentals-of-Visualization-with-Tableau_Utility-and-Usefulness.png'),
  },
  'Fundamentals-of-Visualization-with-Tableau_Learning-Outcomes': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Fundamentals-of-Visualization-with-Tableau_Learning-Outcomes.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Fundamentals-of-Visualization-with-Tableau_Learning-Outcomes.png'),
  },
  'Fundamentals-of-Visualization-with-Tableau_Course-Material-and-Understanding': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Fundamentals-of-Visualization-with-Tableau_Course-Material-and-Understanding.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Fundamentals-of-Visualization-with-Tableau_Course-Material-and-Understanding.png'),
  },
  'Fundamentals-of-Visualization-with-Tableau_Instructor': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Fundamentals-of-Visualization-with-Tableau_Instructor.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Fundamentals-of-Visualization-with-Tableau_Instructor.png'),
  },
  'Fundamentals-of-Visualization-with-Tableau_Course-Material': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Fundamentals-of-Visualization-with-Tableau_Course-Material.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Fundamentals-of-Visualization-with-Tableau_Course-Material.png'),
  },
  'Computational-Thinking-for-Problem-Solving_Exams': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Computational-Thinking-for-Problem-Solving_Exams.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Computational-Thinking-for-Problem-Solving_Exams.png'),
  },
  'Computational-Thinking-for-Problem-Solving_Workload': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Computational-Thinking-for-Problem-Solving_Workload.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Computational-Thinking-for-Problem-Solving_Workload.png'),
  },
  'Computational-Thinking-for-Problem-Solving_Assignments': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Computational-Thinking-for-Problem-Solving_Assignments.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Computational-Thinking-for-Problem-Solving_Assignments.png'),
  },
  'Computational-Thinking-for-Problem-Solving_Lectures': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Computational-Thinking-for-Problem-Solving_Lectures.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Computational-Thinking-for-Problem-Solving_Lectures.png'),
  },
  'Computational-Thinking-for-Problem-Solving_Grading': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Computational-Thinking-for-Problem-Solving_Grading.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Computational-Thinking-for-Problem-Solving_Grading.png'),
  },
  'Computational-Thinking-for-Problem-Solving_Course-Engagement-and-Course-FeelingsSentiment': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Computational-Thinking-for-Problem-Solving_Course-Engagement-and-Course-FeelingsSentiment.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Computational-Thinking-for-Problem-Solving_Course-Engagement-and-Course-FeelingsSentiment.png'),
  },
  'Computational-Thinking-for-Problem-Solving_Course-Structure': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Computational-Thinking-for-Problem-Solving_Course-Structure.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Computational-Thinking-for-Problem-Solving_Course-Structure.png'),
  },
  'Computational-Thinking-for-Problem-Solving_Utility-and-Usefulness': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Computational-Thinking-for-Problem-Solving_Utility-and-Usefulness.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Computational-Thinking-for-Problem-Solving_Utility-and-Usefulness.png'),
  },
  'Computational-Thinking-for-Problem-Solving_Learning-Outcomes': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Computational-Thinking-for-Problem-Solving_Learning-Outcomes.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Computational-Thinking-for-Problem-Solving_Learning-Outcomes.png'),
  },
  'Computational-Thinking-for-Problem-Solving_Course-Material-and-Understanding': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Computational-Thinking-for-Problem-Solving_Course-Material-and-Understanding.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Computational-Thinking-for-Problem-Solving_Course-Material-and-Understanding.png'),
  },
  'Computational-Thinking-for-Problem-Solving_Instructor': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Computational-Thinking-for-Problem-Solving_Instructor.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Computational-Thinking-for-Problem-Solving_Instructor.png'),
  },
  'Computational-Thinking-for-Problem-Solving_Course-Material': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Computational-Thinking-for-Problem-Solving_Course-Material.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Computational-Thinking-for-Problem-Solving_Course-Material.png'),
  },
  'Programming-Fundamentals_Exams': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Programming-Fundamentals_Exams.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Programming-Fundamentals_Exams.png'),
  },
  'Programming-Fundamentals_Workload': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Programming-Fundamentals_Workload.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Programming-Fundamentals_Workload.png'),
  },
  'Programming-Fundamentals_Assignments': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Programming-Fundamentals_Assignments.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Programming-Fundamentals_Assignments.png'),
  },
  'Programming-Fundamentals_Lectures': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Programming-Fundamentals_Lectures.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Programming-Fundamentals_Lectures.png'),
  },
  'Programming-Fundamentals_Grading': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Programming-Fundamentals_Grading.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Programming-Fundamentals_Grading.png'),
  },
  'Programming-Fundamentals_Course-Engagement-and-Course-FeelingsSentiment': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Programming-Fundamentals_Course-Engagement-and-Course-FeelingsSentiment.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Programming-Fundamentals_Course-Engagement-and-Course-FeelingsSentiment.png'),
  },
  'Programming-Fundamentals_Course-Structure': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Programming-Fundamentals_Course-Structure.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Programming-Fundamentals_Course-Structure.png'),
  },
  'Programming-Fundamentals_Utility-and-Usefulness': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Programming-Fundamentals_Utility-and-Usefulness.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Programming-Fundamentals_Utility-and-Usefulness.png'),
  },
  'Programming-Fundamentals_Learning-Outcomes': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Programming-Fundamentals_Learning-Outcomes.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Programming-Fundamentals_Learning-Outcomes.png'),
  },
  'Programming-Fundamentals_Course-Material-and-Understanding': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Programming-Fundamentals_Course-Material-and-Understanding.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Programming-Fundamentals_Course-Material-and-Understanding.png'),
  },
  'Programming-Fundamentals_Instructor': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Programming-Fundamentals_Instructor.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Programming-Fundamentals_Instructor.png'),
  },
  'Programming-Fundamentals_Course-Material': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Programming-Fundamentals_Course-Material.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Programming-Fundamentals_Course-Material.png'),
  },
  'Applied-Plotting-Charting-Data-Representation-in-Python_Exams': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Applied-Plotting-Charting-Data-Representation-in-Python_Exams.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Applied-Plotting-Charting-Data-Representation-in-Python_Exams.png'),
  },
  'Applied-Plotting-Charting-Data-Representation-in-Python_Workload': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Applied-Plotting-Charting-Data-Representation-in-Python_Workload.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Applied-Plotting-Charting-Data-Representation-in-Python_Workload.png'),
  },
  'Applied-Plotting-Charting-Data-Representation-in-Python_Assignments': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Applied-Plotting-Charting-Data-Representation-in-Python_Assignments.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Applied-Plotting-Charting-Data-Representation-in-Python_Assignments.png'),
  },
  'Applied-Plotting-Charting-Data-Representation-in-Python_Lectures': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Applied-Plotting-Charting-Data-Representation-in-Python_Lectures.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Applied-Plotting-Charting-Data-Representation-in-Python_Lectures.png'),
  },
  'Applied-Plotting-Charting-Data-Representation-in-Python_Grading': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Applied-Plotting-Charting-Data-Representation-in-Python_Grading.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Applied-Plotting-Charting-Data-Representation-in-Python_Grading.png'),
  },
  'Applied-Plotting-Charting-Data-Representation-in-Python_Course-Engagement-and-Course-FeelingsSentiment': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Applied-Plotting-Charting-Data-Representation-in-Python_Course-Engagement-and-Course-FeelingsSentiment.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Applied-Plotting-Charting-Data-Representation-in-Python_Course-Engagement-and-Course-FeelingsSentiment.png'),
  },
  'Applied-Plotting-Charting-Data-Representation-in-Python_Course-Structure': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Applied-Plotting-Charting-Data-Representation-in-Python_Course-Structure.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Applied-Plotting-Charting-Data-Representation-in-Python_Course-Structure.png'),
  },
  'Applied-Plotting-Charting-Data-Representation-in-Python_Utility-and-Usefulness': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Applied-Plotting-Charting-Data-Representation-in-Python_Utility-and-Usefulness.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Applied-Plotting-Charting-Data-Representation-in-Python_Utility-and-Usefulness.png'),
  },
  'Applied-Plotting-Charting-Data-Representation-in-Python_Learning-Outcomes': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Applied-Plotting-Charting-Data-Representation-in-Python_Learning-Outcomes.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Applied-Plotting-Charting-Data-Representation-in-Python_Learning-Outcomes.png'),
  },
  'Applied-Plotting-Charting-Data-Representation-in-Python_Course-Material-and-Understanding': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Applied-Plotting-Charting-Data-Representation-in-Python_Course-Material-and-Understanding.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Applied-Plotting-Charting-Data-Representation-in-Python_Course-Material-and-Understanding.png'),
  },
  'Applied-Plotting-Charting-Data-Representation-in-Python_Instructor': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Applied-Plotting-Charting-Data-Representation-in-Python_Instructor.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Applied-Plotting-Charting-Data-Representation-in-Python_Instructor.png'),
  },
  'Applied-Plotting-Charting-Data-Representation-in-Python_Course-Material': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Applied-Plotting-Charting-Data-Representation-in-Python_Course-Material.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Applied-Plotting-Charting-Data-Representation-in-Python_Course-Material.png'),
  },
  'Introduction-to-Big-Data_Exams': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Introduction-to-Big-Data_Exams.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Introduction-to-Big-Data_Exams.png'),
  },
  'Introduction-to-Big-Data_Workload': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Introduction-to-Big-Data_Workload.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Introduction-to-Big-Data_Workload.png'),
  },
  'Introduction-to-Big-Data_Assignments': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Introduction-to-Big-Data_Assignments.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Introduction-to-Big-Data_Assignments.png'),
  },
  'Introduction-to-Big-Data_Lectures': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Introduction-to-Big-Data_Lectures.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Introduction-to-Big-Data_Lectures.png'),
  },
  'Introduction-to-Big-Data_Grading': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Introduction-to-Big-Data_Grading.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Introduction-to-Big-Data_Grading.png'),
  },
  'Introduction-to-Big-Data_Course-Engagement-and-Course-FeelingsSentiment': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Introduction-to-Big-Data_Course-Engagement-and-Course-FeelingsSentiment.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Introduction-to-Big-Data_Course-Engagement-and-Course-FeelingsSentiment.png'),
  },
  'Introduction-to-Big-Data_Course-Structure': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Introduction-to-Big-Data_Course-Structure.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Introduction-to-Big-Data_Course-Structure.png'),
  },
  'Introduction-to-Big-Data_Utility-and-Usefulness': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Introduction-to-Big-Data_Utility-and-Usefulness.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Introduction-to-Big-Data_Utility-and-Usefulness.png'),
  },
  'Introduction-to-Big-Data_Learning-Outcomes': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Introduction-to-Big-Data_Learning-Outcomes.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Introduction-to-Big-Data_Learning-Outcomes.png'),
  },
  'Introduction-to-Big-Data_Course-Material-and-Understanding': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Introduction-to-Big-Data_Course-Material-and-Understanding.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Introduction-to-Big-Data_Course-Material-and-Understanding.png'),
  },
  'Introduction-to-Big-Data_Instructor': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Introduction-to-Big-Data_Instructor.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Introduction-to-Big-Data_Instructor.png'),
  },
  'Introduction-to-Big-Data_Course-Material': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Introduction-to-Big-Data_Course-Material.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Introduction-to-Big-Data_Course-Material.png'),
  },
  'Applied-Machine-Learning-in-Python_Exams': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Applied-Machine-Learning-in-Python_Exams.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Applied-Machine-Learning-in-Python_Exams.png'),
  },
  'Applied-Machine-Learning-in-Python_Workload': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Applied-Machine-Learning-in-Python_Workload.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Applied-Machine-Learning-in-Python_Workload.png'),
  },
  'Applied-Machine-Learning-in-Python_Assignments': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Applied-Machine-Learning-in-Python_Assignments.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Applied-Machine-Learning-in-Python_Assignments.png'),
  },
  'Applied-Machine-Learning-in-Python_Lectures': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Applied-Machine-Learning-in-Python_Lectures.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Applied-Machine-Learning-in-Python_Lectures.png'),
  },
  'Applied-Machine-Learning-in-Python_Grading': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Applied-Machine-Learning-in-Python_Grading.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Applied-Machine-Learning-in-Python_Grading.png'),
  },
  'Applied-Machine-Learning-in-Python_Course-Engagement-and-Course-FeelingsSentiment': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Applied-Machine-Learning-in-Python_Course-Engagement-and-Course-FeelingsSentiment.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Applied-Machine-Learning-in-Python_Course-Engagement-and-Course-FeelingsSentiment.png'),
  },
  'Applied-Machine-Learning-in-Python_Course-Structure': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Applied-Machine-Learning-in-Python_Course-Structure.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Applied-Machine-Learning-in-Python_Course-Structure.png'),
  },
  'Applied-Machine-Learning-in-Python_Utility-and-Usefulness': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Applied-Machine-Learning-in-Python_Utility-and-Usefulness.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Applied-Machine-Learning-in-Python_Utility-and-Usefulness.png'),
  },
  'Applied-Machine-Learning-in-Python_Learning-Outcomes': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Applied-Machine-Learning-in-Python_Learning-Outcomes.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Applied-Machine-Learning-in-Python_Learning-Outcomes.png'),
  },
  'Applied-Machine-Learning-in-Python_Course-Material-and-Understanding': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Applied-Machine-Learning-in-Python_Course-Material-and-Understanding.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Applied-Machine-Learning-in-Python_Course-Material-and-Understanding.png'),
  },
  'Applied-Machine-Learning-in-Python_Instructor': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Applied-Machine-Learning-in-Python_Instructor.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Applied-Machine-Learning-in-Python_Instructor.png'),
  },
  'Applied-Machine-Learning-in-Python_Course-Material': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Applied-Machine-Learning-in-Python_Course-Material.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Applied-Machine-Learning-in-Python_Course-Material.png'),
  },
  'Capstone-Retrieving-Processing-and-Visualizing-Data-with-Python_Exams': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Capstone-Retrieving-Processing-and-Visualizing-Data-with-Python_Exams.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Capstone-Retrieving-Processing-and-Visualizing-Data-with-Python_Exams.png'),
  },
  'Capstone-Retrieving-Processing-and-Visualizing-Data-with-Python_Workload': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Capstone-Retrieving-Processing-and-Visualizing-Data-with-Python_Workload.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Capstone-Retrieving-Processing-and-Visualizing-Data-with-Python_Workload.png'),
  },
  'Capstone-Retrieving-Processing-and-Visualizing-Data-with-Python_Assignments': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Capstone-Retrieving-Processing-and-Visualizing-Data-with-Python_Assignments.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Capstone-Retrieving-Processing-and-Visualizing-Data-with-Python_Assignments.png'),
  },
  'Capstone-Retrieving-Processing-and-Visualizing-Data-with-Python_Lectures': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Capstone-Retrieving-Processing-and-Visualizing-Data-with-Python_Lectures.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Capstone-Retrieving-Processing-and-Visualizing-Data-with-Python_Lectures.png'),
  },
  'Capstone-Retrieving-Processing-and-Visualizing-Data-with-Python_Grading': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Capstone-Retrieving-Processing-and-Visualizing-Data-with-Python_Grading.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Capstone-Retrieving-Processing-and-Visualizing-Data-with-Python_Grading.png'),
  },
  'Capstone-Retrieving-Processing-and-Visualizing-Data-with-Python_Course-Engagement-and-Course-FeelingsSentiment': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Capstone-Retrieving-Processing-and-Visualizing-Data-with-Python_Course-Engagement-and-Course-FeelingsSentiment.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Capstone-Retrieving-Processing-and-Visualizing-Data-with-Python_Course-Engagement-and-Course-FeelingsSentiment.png'),
  },
  'Capstone-Retrieving-Processing-and-Visualizing-Data-with-Python_Course-Structure': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Capstone-Retrieving-Processing-and-Visualizing-Data-with-Python_Course-Structure.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Capstone-Retrieving-Processing-and-Visualizing-Data-with-Python_Course-Structure.png'),
  },
  'Capstone-Retrieving-Processing-and-Visualizing-Data-with-Python_Utility-and-Usefulness': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Capstone-Retrieving-Processing-and-Visualizing-Data-with-Python_Utility-and-Usefulness.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Capstone-Retrieving-Processing-and-Visualizing-Data-with-Python_Utility-and-Usefulness.png'),
  },
  'Capstone-Retrieving-Processing-and-Visualizing-Data-with-Python_Learning-Outcomes': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Capstone-Retrieving-Processing-and-Visualizing-Data-with-Python_Learning-Outcomes.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Capstone-Retrieving-Processing-and-Visualizing-Data-with-Python_Learning-Outcomes.png'),
  },
  'Capstone-Retrieving-Processing-and-Visualizing-Data-with-Python_Course-Material-and-Understanding': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Capstone-Retrieving-Processing-and-Visualizing-Data-with-Python_Course-Material-and-Understanding.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Capstone-Retrieving-Processing-and-Visualizing-Data-with-Python_Course-Material-and-Understanding.png'),
  },
  'Capstone-Retrieving-Processing-and-Visualizing-Data-with-Python_Instructor': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Capstone-Retrieving-Processing-and-Visualizing-Data-with-Python_Instructor.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Capstone-Retrieving-Processing-and-Visualizing-Data-with-Python_Instructor.png'),
  },
  'Capstone-Retrieving-Processing-and-Visualizing-Data-with-Python_Course-Material': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Capstone-Retrieving-Processing-and-Visualizing-Data-with-Python_Course-Material.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Capstone-Retrieving-Processing-and-Visualizing-Data-with-Python_Course-Material.png'),
  },
  'Python-Functions-Files-and-Dictionaries_Exams': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-Functions-Files-and-Dictionaries_Exams.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-Functions-Files-and-Dictionaries_Exams.png'),
  },
  'Python-Functions-Files-and-Dictionaries_Workload': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-Functions-Files-and-Dictionaries_Workload.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-Functions-Files-and-Dictionaries_Workload.png'),
  },
  'Python-Functions-Files-and-Dictionaries_Assignments': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-Functions-Files-and-Dictionaries_Assignments.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-Functions-Files-and-Dictionaries_Assignments.png'),
  },
  'Python-Functions-Files-and-Dictionaries_Lectures': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-Functions-Files-and-Dictionaries_Lectures.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-Functions-Files-and-Dictionaries_Lectures.png'),
  },
  'Python-Functions-Files-and-Dictionaries_Grading': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-Functions-Files-and-Dictionaries_Grading.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-Functions-Files-and-Dictionaries_Grading.png'),
  },
  'Python-Functions-Files-and-Dictionaries_Course-Engagement-and-Course-FeelingsSentiment': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-Functions-Files-and-Dictionaries_Course-Engagement-and-Course-FeelingsSentiment.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-Functions-Files-and-Dictionaries_Course-Engagement-and-Course-FeelingsSentiment.png'),
  },
  'Python-Functions-Files-and-Dictionaries_Course-Structure': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-Functions-Files-and-Dictionaries_Course-Structure.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-Functions-Files-and-Dictionaries_Course-Structure.png'),
  },
  'Python-Functions-Files-and-Dictionaries_Utility-and-Usefulness': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-Functions-Files-and-Dictionaries_Utility-and-Usefulness.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-Functions-Files-and-Dictionaries_Utility-and-Usefulness.png'),
  },
  'Python-Functions-Files-and-Dictionaries_Learning-Outcomes': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-Functions-Files-and-Dictionaries_Learning-Outcomes.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-Functions-Files-and-Dictionaries_Learning-Outcomes.png'),
  },
  'Python-Functions-Files-and-Dictionaries_Course-Material-and-Understanding': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-Functions-Files-and-Dictionaries_Course-Material-and-Understanding.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-Functions-Files-and-Dictionaries_Course-Material-and-Understanding.png'),
  },
  'Python-Functions-Files-and-Dictionaries_Instructor': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-Functions-Files-and-Dictionaries_Instructor.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-Functions-Files-and-Dictionaries_Instructor.png'),
  },
  'Python-Functions-Files-and-Dictionaries_Course-Material': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-Functions-Files-and-Dictionaries_Course-Material.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-Functions-Files-and-Dictionaries_Course-Material.png'),
  },
  'Object-Oriented-Data-Structures-in-C_Exams': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Object-Oriented-Data-Structures-in-C_Exams.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Object-Oriented-Data-Structures-in-C_Exams.png'),
  },
  'Object-Oriented-Data-Structures-in-C_Workload': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Object-Oriented-Data-Structures-in-C_Workload.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Object-Oriented-Data-Structures-in-C_Workload.png'),
  },
  'Object-Oriented-Data-Structures-in-C_Assignments': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Object-Oriented-Data-Structures-in-C_Assignments.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Object-Oriented-Data-Structures-in-C_Assignments.png'),
  },
  'Object-Oriented-Data-Structures-in-C_Lectures': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Object-Oriented-Data-Structures-in-C_Lectures.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Object-Oriented-Data-Structures-in-C_Lectures.png'),
  },
  'Object-Oriented-Data-Structures-in-C_Grading': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Object-Oriented-Data-Structures-in-C_Grading.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Object-Oriented-Data-Structures-in-C_Grading.png'),
  },
  'Object-Oriented-Data-Structures-in-C_Course-Engagement-and-Course-FeelingsSentiment': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Object-Oriented-Data-Structures-in-C_Course-Engagement-and-Course-FeelingsSentiment.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Object-Oriented-Data-Structures-in-C_Course-Engagement-and-Course-FeelingsSentiment.png'),
  },
  'Object-Oriented-Data-Structures-in-C_Course-Structure': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Object-Oriented-Data-Structures-in-C_Course-Structure.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Object-Oriented-Data-Structures-in-C_Course-Structure.png'),
  },
  'Object-Oriented-Data-Structures-in-C_Utility-and-Usefulness': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Object-Oriented-Data-Structures-in-C_Utility-and-Usefulness.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Object-Oriented-Data-Structures-in-C_Utility-and-Usefulness.png'),
  },
  'Object-Oriented-Data-Structures-in-C_Learning-Outcomes': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Object-Oriented-Data-Structures-in-C_Learning-Outcomes.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Object-Oriented-Data-Structures-in-C_Learning-Outcomes.png'),
  },
  'Object-Oriented-Data-Structures-in-C_Course-Material-and-Understanding': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Object-Oriented-Data-Structures-in-C_Course-Material-and-Understanding.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Object-Oriented-Data-Structures-in-C_Course-Material-and-Understanding.png'),
  },
  'Object-Oriented-Data-Structures-in-C_Instructor': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Object-Oriented-Data-Structures-in-C_Instructor.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Object-Oriented-Data-Structures-in-C_Instructor.png'),
  },
  'Object-Oriented-Data-Structures-in-C_Course-Material': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Object-Oriented-Data-Structures-in-C_Course-Material.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Object-Oriented-Data-Structures-in-C_Course-Material.png'),
  },
  'Python-and-Statistics-for-Financial-Analysis_Exams': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-and-Statistics-for-Financial-Analysis_Exams.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-and-Statistics-for-Financial-Analysis_Exams.png'),
  },
  'Python-and-Statistics-for-Financial-Analysis_Workload': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-and-Statistics-for-Financial-Analysis_Workload.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-and-Statistics-for-Financial-Analysis_Workload.png'),
  },
  'Python-and-Statistics-for-Financial-Analysis_Assignments': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-and-Statistics-for-Financial-Analysis_Assignments.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-and-Statistics-for-Financial-Analysis_Assignments.png'),
  },
  'Python-and-Statistics-for-Financial-Analysis_Lectures': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-and-Statistics-for-Financial-Analysis_Lectures.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-and-Statistics-for-Financial-Analysis_Lectures.png'),
  },
  'Python-and-Statistics-for-Financial-Analysis_Grading': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-and-Statistics-for-Financial-Analysis_Grading.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-and-Statistics-for-Financial-Analysis_Grading.png'),
  },
  'Python-and-Statistics-for-Financial-Analysis_Course-Engagement-and-Course-FeelingsSentiment': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-and-Statistics-for-Financial-Analysis_Course-Engagement-and-Course-FeelingsSentiment.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-and-Statistics-for-Financial-Analysis_Course-Engagement-and-Course-FeelingsSentiment.png'),
  },
  'Python-and-Statistics-for-Financial-Analysis_Course-Structure': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-and-Statistics-for-Financial-Analysis_Course-Structure.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-and-Statistics-for-Financial-Analysis_Course-Structure.png'),
  },
  'Python-and-Statistics-for-Financial-Analysis_Utility-and-Usefulness': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-and-Statistics-for-Financial-Analysis_Utility-and-Usefulness.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-and-Statistics-for-Financial-Analysis_Utility-and-Usefulness.png'),
  },
  'Python-and-Statistics-for-Financial-Analysis_Learning-Outcomes': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-and-Statistics-for-Financial-Analysis_Learning-Outcomes.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-and-Statistics-for-Financial-Analysis_Learning-Outcomes.png'),
  },
  'Python-and-Statistics-for-Financial-Analysis_Course-Material-and-Understanding': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-and-Statistics-for-Financial-Analysis_Course-Material-and-Understanding.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-and-Statistics-for-Financial-Analysis_Course-Material-and-Understanding.png'),
  },
  'Python-and-Statistics-for-Financial-Analysis_Instructor': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-and-Statistics-for-Financial-Analysis_Instructor.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-and-Statistics-for-Financial-Analysis_Instructor.png'),
  },
  'Python-and-Statistics-for-Financial-Analysis_Course-Material': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-and-Statistics-for-Financial-Analysis_Course-Material.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-and-Statistics-for-Financial-Analysis_Course-Material.png'),
  },
  'Data-Analytics-for-Lean-Six-Sigma_Exams': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Data-Analytics-for-Lean-Six-Sigma_Exams.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Data-Analytics-for-Lean-Six-Sigma_Exams.png'),
  },
  'Data-Analytics-for-Lean-Six-Sigma_Workload': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Data-Analytics-for-Lean-Six-Sigma_Workload.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Data-Analytics-for-Lean-Six-Sigma_Workload.png'),
  },
  'Data-Analytics-for-Lean-Six-Sigma_Assignments': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Data-Analytics-for-Lean-Six-Sigma_Assignments.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Data-Analytics-for-Lean-Six-Sigma_Assignments.png'),
  },
  'Data-Analytics-for-Lean-Six-Sigma_Lectures': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Data-Analytics-for-Lean-Six-Sigma_Lectures.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Data-Analytics-for-Lean-Six-Sigma_Lectures.png'),
  },
  'Data-Analytics-for-Lean-Six-Sigma_Grading': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Data-Analytics-for-Lean-Six-Sigma_Grading.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Data-Analytics-for-Lean-Six-Sigma_Grading.png'),
  },
  'Data-Analytics-for-Lean-Six-Sigma_Course-Engagement-and-Course-FeelingsSentiment': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Data-Analytics-for-Lean-Six-Sigma_Course-Engagement-and-Course-FeelingsSentiment.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Data-Analytics-for-Lean-Six-Sigma_Course-Engagement-and-Course-FeelingsSentiment.png'),
  },
  'Data-Analytics-for-Lean-Six-Sigma_Course-Structure': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Data-Analytics-for-Lean-Six-Sigma_Course-Structure.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Data-Analytics-for-Lean-Six-Sigma_Course-Structure.png'),
  },
  'Data-Analytics-for-Lean-Six-Sigma_Utility-and-Usefulness': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Data-Analytics-for-Lean-Six-Sigma_Utility-and-Usefulness.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Data-Analytics-for-Lean-Six-Sigma_Utility-and-Usefulness.png'),
  },
  'Data-Analytics-for-Lean-Six-Sigma_Learning-Outcomes': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Data-Analytics-for-Lean-Six-Sigma_Learning-Outcomes.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Data-Analytics-for-Lean-Six-Sigma_Learning-Outcomes.png'),
  },
  'Data-Analytics-for-Lean-Six-Sigma_Course-Material-and-Understanding': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Data-Analytics-for-Lean-Six-Sigma_Course-Material-and-Understanding.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Data-Analytics-for-Lean-Six-Sigma_Course-Material-and-Understanding.png'),
  },
  'Data-Analytics-for-Lean-Six-Sigma_Instructor': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Data-Analytics-for-Lean-Six-Sigma_Instructor.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Data-Analytics-for-Lean-Six-Sigma_Instructor.png'),
  },
  'Data-Analytics-for-Lean-Six-Sigma_Course-Material': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Data-Analytics-for-Lean-Six-Sigma_Course-Material.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Data-Analytics-for-Lean-Six-Sigma_Course-Material.png'),
  },
  'Python-Programming-A-Concise-Introduction_Exams': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-Programming-A-Concise-Introduction_Exams.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-Programming-A-Concise-Introduction_Exams.png'),
  },
  'Python-Programming-A-Concise-Introduction_Workload': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-Programming-A-Concise-Introduction_Workload.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-Programming-A-Concise-Introduction_Workload.png'),
  },
  'Python-Programming-A-Concise-Introduction_Assignments': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-Programming-A-Concise-Introduction_Assignments.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-Programming-A-Concise-Introduction_Assignments.png'),
  },
  'Python-Programming-A-Concise-Introduction_Lectures': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-Programming-A-Concise-Introduction_Lectures.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-Programming-A-Concise-Introduction_Lectures.png'),
  },
  'Python-Programming-A-Concise-Introduction_Grading': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-Programming-A-Concise-Introduction_Grading.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-Programming-A-Concise-Introduction_Grading.png'),
  },
  'Python-Programming-A-Concise-Introduction_Course-Engagement-and-Course-FeelingsSentiment': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-Programming-A-Concise-Introduction_Course-Engagement-and-Course-FeelingsSentiment.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-Programming-A-Concise-Introduction_Course-Engagement-and-Course-FeelingsSentiment.png'),
  },
  'Python-Programming-A-Concise-Introduction_Course-Structure': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-Programming-A-Concise-Introduction_Course-Structure.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-Programming-A-Concise-Introduction_Course-Structure.png'),
  },
  'Python-Programming-A-Concise-Introduction_Utility-and-Usefulness': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-Programming-A-Concise-Introduction_Utility-and-Usefulness.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-Programming-A-Concise-Introduction_Utility-and-Usefulness.png'),
  },
  'Python-Programming-A-Concise-Introduction_Learning-Outcomes': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-Programming-A-Concise-Introduction_Learning-Outcomes.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-Programming-A-Concise-Introduction_Learning-Outcomes.png'),
  },
  'Python-Programming-A-Concise-Introduction_Course-Material-and-Understanding': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-Programming-A-Concise-Introduction_Course-Material-and-Understanding.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-Programming-A-Concise-Introduction_Course-Material-and-Understanding.png'),
  },
  'Python-Programming-A-Concise-Introduction_Instructor': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-Programming-A-Concise-Introduction_Instructor.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-Programming-A-Concise-Introduction_Instructor.png'),
  },
  'Python-Programming-A-Concise-Introduction_Course-Material': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Python-Programming-A-Concise-Introduction_Course-Material.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Python-Programming-A-Concise-Introduction_Course-Material.png'),
  },
  'Machine-Learning-for-All_Exams': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Machine-Learning-for-All_Exams.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Machine-Learning-for-All_Exams.png'),
  },
  'Machine-Learning-for-All_Workload': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Machine-Learning-for-All_Workload.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Machine-Learning-for-All_Workload.png'),
  },
  'Machine-Learning-for-All_Assignments': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Machine-Learning-for-All_Assignments.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Machine-Learning-for-All_Assignments.png'),
  },
  'Machine-Learning-for-All_Lectures': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Machine-Learning-for-All_Lectures.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Machine-Learning-for-All_Lectures.png'),
  },
  'Machine-Learning-for-All_Grading': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Machine-Learning-for-All_Grading.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Machine-Learning-for-All_Grading.png'),
  },
  'Machine-Learning-for-All_Course-Engagement-and-Course-FeelingsSentiment': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Machine-Learning-for-All_Course-Engagement-and-Course-FeelingsSentiment.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Machine-Learning-for-All_Course-Engagement-and-Course-FeelingsSentiment.png'),
  },
  'Machine-Learning-for-All_Course-Structure': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Machine-Learning-for-All_Course-Structure.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Machine-Learning-for-All_Course-Structure.png'),
  },
  'Machine-Learning-for-All_Utility-and-Usefulness': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Machine-Learning-for-All_Utility-and-Usefulness.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Machine-Learning-for-All_Utility-and-Usefulness.png'),
  },
  'Machine-Learning-for-All_Learning-Outcomes': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Machine-Learning-for-All_Learning-Outcomes.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Machine-Learning-for-All_Learning-Outcomes.png'),
  },
  'Machine-Learning-for-All_Course-Material-and-Understanding': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Machine-Learning-for-All_Course-Material-and-Understanding.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Machine-Learning-for-All_Course-Material-and-Understanding.png'),
  },
  'Machine-Learning-for-All_Instructor': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Machine-Learning-for-All_Instructor.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Machine-Learning-for-All_Instructor.png'),
  },
  'Machine-Learning-for-All_Course-Material': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Machine-Learning-for-All_Course-Material.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Machine-Learning-for-All_Course-Material.png'),
  },
  'The-Introduction-to-Quantum-Computing_Workload': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_The-Introduction-to-Quantum-Computing_Workload.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_The-Introduction-to-Quantum-Computing_Workload.png'),
  },
  'The-Introduction-to-Quantum-Computing_Assignments': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_The-Introduction-to-Quantum-Computing_Assignments.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_The-Introduction-to-Quantum-Computing_Assignments.png'),
  },
  'The-Introduction-to-Quantum-Computing_Lectures': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_The-Introduction-to-Quantum-Computing_Lectures.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_The-Introduction-to-Quantum-Computing_Lectures.png'),
  },
  'The-Introduction-to-Quantum-Computing_Grading': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_The-Introduction-to-Quantum-Computing_Grading.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_The-Introduction-to-Quantum-Computing_Grading.png'),
  },
  'The-Introduction-to-Quantum-Computing_Course-Engagement-and-Course-FeelingsSentiment': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_The-Introduction-to-Quantum-Computing_Course-Engagement-and-Course-FeelingsSentiment.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_The-Introduction-to-Quantum-Computing_Course-Engagement-and-Course-FeelingsSentiment.png'),
  },
  'The-Introduction-to-Quantum-Computing_Course-Structure': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_The-Introduction-to-Quantum-Computing_Course-Structure.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_The-Introduction-to-Quantum-Computing_Course-Structure.png'),
  },
  'The-Introduction-to-Quantum-Computing_Utility-and-Usefulness': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_The-Introduction-to-Quantum-Computing_Utility-and-Usefulness.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_The-Introduction-to-Quantum-Computing_Utility-and-Usefulness.png'),
  },
  'The-Introduction-to-Quantum-Computing_Learning-Outcomes': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_The-Introduction-to-Quantum-Computing_Learning-Outcomes.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_The-Introduction-to-Quantum-Computing_Learning-Outcomes.png'),
  },
  'The-Introduction-to-Quantum-Computing_Instructor': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_The-Introduction-to-Quantum-Computing_Instructor.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_The-Introduction-to-Quantum-Computing_Instructor.png'),
  },
  'The-Introduction-to-Quantum-Computing_Course-Material': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_The-Introduction-to-Quantum-Computing_Course-Material.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_The-Introduction-to-Quantum-Computing_Course-Material.png'),
  },
  'Object-Oriented-Design_Workload': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Object-Oriented-Design_Workload.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Object-Oriented-Design_Workload.png'),
  },
  'Object-Oriented-Design_Assignments': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Object-Oriented-Design_Assignments.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Object-Oriented-Design_Assignments.png'),
  },
  'Object-Oriented-Design_Lectures': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Object-Oriented-Design_Lectures.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Object-Oriented-Design_Lectures.png'),
  },
  'Object-Oriented-Design_Grading': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Object-Oriented-Design_Grading.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Object-Oriented-Design_Grading.png'),
  },
  'Object-Oriented-Design_Course-Engagement-and-Course-FeelingsSentiment': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Object-Oriented-Design_Course-Engagement-and-Course-FeelingsSentiment.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Object-Oriented-Design_Course-Engagement-and-Course-FeelingsSentiment.png'),
  },
  'Object-Oriented-Design_Course-Structure': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Object-Oriented-Design_Course-Structure.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Object-Oriented-Design_Course-Structure.png'),
  },
  'Object-Oriented-Design_Utility-and-Usefulness': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Object-Oriented-Design_Utility-and-Usefulness.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Object-Oriented-Design_Utility-and-Usefulness.png'),
  },
  'Object-Oriented-Design_Learning-Outcomes': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Object-Oriented-Design_Learning-Outcomes.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Object-Oriented-Design_Learning-Outcomes.png'),
  },
  'Object-Oriented-Design_Course-Material-and-Understanding': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Object-Oriented-Design_Course-Material-and-Understanding.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Object-Oriented-Design_Course-Material-and-Understanding.png'),
  },
  'Object-Oriented-Design_Instructor': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Object-Oriented-Design_Instructor.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Object-Oriented-Design_Instructor.png'),
  },
  'Object-Oriented-Design_Course-Material': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Object-Oriented-Design_Course-Material.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Object-Oriented-Design_Course-Material.png'),
  },
  'Introduction-to-Computer-Programming_Exams': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Introduction-to-Computer-Programming_Exams.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Introduction-to-Computer-Programming_Exams.png'),
  },
  'Introduction-to-Computer-Programming_Workload': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Introduction-to-Computer-Programming_Workload.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Introduction-to-Computer-Programming_Workload.png'),
  },
  'Introduction-to-Computer-Programming_Assignments': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Introduction-to-Computer-Programming_Assignments.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Introduction-to-Computer-Programming_Assignments.png'),
  },
  'Introduction-to-Computer-Programming_Lectures': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Introduction-to-Computer-Programming_Lectures.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Introduction-to-Computer-Programming_Lectures.png'),
  },
  'Introduction-to-Computer-Programming_Grading': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Introduction-to-Computer-Programming_Grading.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Introduction-to-Computer-Programming_Grading.png'),
  },
  'Introduction-to-Computer-Programming_Course-Engagement-and-Course-FeelingsSentiment': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Introduction-to-Computer-Programming_Course-Engagement-and-Course-FeelingsSentiment.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Introduction-to-Computer-Programming_Course-Engagement-and-Course-FeelingsSentiment.png'),
  },
  'Introduction-to-Computer-Programming_Course-Structure': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Introduction-to-Computer-Programming_Course-Structure.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Introduction-to-Computer-Programming_Course-Structure.png'),
  },
  'Introduction-to-Computer-Programming_Utility-and-Usefulness': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Introduction-to-Computer-Programming_Utility-and-Usefulness.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Introduction-to-Computer-Programming_Utility-and-Usefulness.png'),
  },
  'Introduction-to-Computer-Programming_Learning-Outcomes': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Introduction-to-Computer-Programming_Learning-Outcomes.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Introduction-to-Computer-Programming_Learning-Outcomes.png'),
  },
  'Introduction-to-Computer-Programming_Course-Material-and-Understanding': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Introduction-to-Computer-Programming_Course-Material-and-Understanding.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Introduction-to-Computer-Programming_Course-Material-and-Understanding.png'),
  },
  'Introduction-to-Computer-Programming_Instructor': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Introduction-to-Computer-Programming_Instructor.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Introduction-to-Computer-Programming_Instructor.png'),
  },
  'Introduction-to-Computer-Programming_Course-Material': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Introduction-to-Computer-Programming_Course-Material.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Introduction-to-Computer-Programming_Course-Material.png'),
  },
  'Research-Data-Management-and-Sharing_Workload': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Research-Data-Management-and-Sharing_Workload.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Research-Data-Management-and-Sharing_Workload.png'),
  },
  'Research-Data-Management-and-Sharing_Assignments': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Research-Data-Management-and-Sharing_Assignments.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Research-Data-Management-and-Sharing_Assignments.png'),
  },
  'Research-Data-Management-and-Sharing_Lectures': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Research-Data-Management-and-Sharing_Lectures.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Research-Data-Management-and-Sharing_Lectures.png'),
  },
  'Research-Data-Management-and-Sharing_Grading': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Research-Data-Management-and-Sharing_Grading.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Research-Data-Management-and-Sharing_Grading.png'),
  },
  'Research-Data-Management-and-Sharing_Course-Engagement-and-Course-FeelingsSentiment': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Research-Data-Management-and-Sharing_Course-Engagement-and-Course-FeelingsSentiment.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Research-Data-Management-and-Sharing_Course-Engagement-and-Course-FeelingsSentiment.png'),
  },
  'Research-Data-Management-and-Sharing_Course-Structure': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Research-Data-Management-and-Sharing_Course-Structure.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Research-Data-Management-and-Sharing_Course-Structure.png'),
  },
  'Research-Data-Management-and-Sharing_Utility-and-Usefulness': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Research-Data-Management-and-Sharing_Utility-and-Usefulness.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Research-Data-Management-and-Sharing_Utility-and-Usefulness.png'),
  },
  'Research-Data-Management-and-Sharing_Learning-Outcomes': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Research-Data-Management-and-Sharing_Learning-Outcomes.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Research-Data-Management-and-Sharing_Learning-Outcomes.png'),
  },
  'Research-Data-Management-and-Sharing_Course-Material-and-Understanding': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Research-Data-Management-and-Sharing_Course-Material-and-Understanding.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Research-Data-Management-and-Sharing_Course-Material-and-Understanding.png'),
  },
  'Research-Data-Management-and-Sharing_Instructor': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Research-Data-Management-and-Sharing_Instructor.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Research-Data-Management-and-Sharing_Instructor.png'),
  },
  'Research-Data-Management-and-Sharing_Course-Material': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Research-Data-Management-and-Sharing_Course-Material.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Research-Data-Management-and-Sharing_Course-Material.png'),
  },
  'Digital-Business-Models_Exams': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Digital-Business-Models_Exams.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Digital-Business-Models_Exams.png'),
  },
  'Digital-Business-Models_Workload': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Digital-Business-Models_Workload.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Digital-Business-Models_Workload.png'),
  },
  'Digital-Business-Models_Assignments': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Digital-Business-Models_Assignments.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Digital-Business-Models_Assignments.png'),
  },
  'Digital-Business-Models_Lectures': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Digital-Business-Models_Lectures.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Digital-Business-Models_Lectures.png'),
  },
  'Digital-Business-Models_Course-Engagement-and-Course-FeelingsSentiment': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Digital-Business-Models_Course-Engagement-and-Course-FeelingsSentiment.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Digital-Business-Models_Course-Engagement-and-Course-FeelingsSentiment.png'),
  },
  'Digital-Business-Models_Course-Structure': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Digital-Business-Models_Course-Structure.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Digital-Business-Models_Course-Structure.png'),
  },
  'Digital-Business-Models_Utility-and-Usefulness': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Digital-Business-Models_Utility-and-Usefulness.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Digital-Business-Models_Utility-and-Usefulness.png'),
  },
  'Digital-Business-Models_Learning-Outcomes': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Digital-Business-Models_Learning-Outcomes.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Digital-Business-Models_Learning-Outcomes.png'),
  },
  'Digital-Business-Models_Course-Material-and-Understanding': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Digital-Business-Models_Course-Material-and-Understanding.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Digital-Business-Models_Course-Material-and-Understanding.png'),
  },
  'Digital-Business-Models_Instructor': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Digital-Business-Models_Instructor.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Digital-Business-Models_Instructor.png'),
  },
  'Digital-Business-Models_Course-Material': {
    emotion: require('../images/analysis_plots_topic_module/emotion_timeseries_Digital-Business-Models_Course-Material.png'),
    sentiment: require('../images/analysis_plots_topic_module/sentiment_timeseries_Digital-Business-Models_Course-Material.png'),
  }, 
  };

  // Sanitize the module name and topic name
  const sanitizedModuleName = moduleName
    ?.trim()
    .replace(/\s+/g, '-') // Convert spaces to hyphens
    .replace(/[^\w-]/g, ''); // Remove special characters except hyphens

  const sanitizedTopicName = topic
    ?.trim()
    .replace(/\s+/g, '-') // Convert spaces to hyphens
    .replace(/[^\w-]/g, ''); // Remove special characters except hyphens

  // Combine both sanitized module name and topic to form the image key
  const imageKey = `${sanitizedModuleName}_${sanitizedTopicName}`;

  // Get the images from the mapping
  const emotionImage = imageMapping[imageKey]?.emotion;
  const sentimentImage = imageMapping[imageKey]?.sentiment;

  return (
    <View style={[styles.container, darkMode ? styles.containerDark : styles.containerLight]}>
      <View style={styles.header}>
        <Image source={require('../images/logo.png')} style={styles.logo} resizeMode="contain" />
        <View style={styles.moduleInfoContainer}>
          <Text style={[styles.moduleTitle, darkMode ? styles.textDark : styles.textLight]}>
            {moduleName}
          </Text>
        </View>

        <Switch
          value={darkMode}
          onValueChange={toggleDarkMode}
          thumbColor={darkMode ? '#f4f3f4' : '#f4f3f4'}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
        />
      </View>
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Icon name="arrow-circle-left" style={styles.logoutIcon} />
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
      <Text style={[styles.viewingLabel, darkMode ? styles.textDark : styles.textLight]}>
        Viewing Insights for {topic} in {moduleName}
      </Text>

      <View style={styles.horizontalContainer}>
        <View style={styles.statsContainer}>
          <Text style={[styles.statNumber, darkMode ? styles.textDark : styles.textLight]}>
            {categoryData?.topic_outlook || 'N/A'}
          </Text>
          <Text style={[styles.statLabel, darkMode ? styles.textDark : styles.textLight]}>
            Outlook
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <Text style={[styles.statNumber, darkMode ? styles.textDark : styles.textLight]}>
            {categoryData?.positive_reviews_topic + '%' || 'N/A'}
          </Text>
          <Text style={[styles.statLabel, darkMode ? styles.textDark : styles.textLight]}>
            Positive
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <Text style={[styles.statNumber, darkMode ? styles.textDark : styles.textLight]}>
            {categoryData?.negative_reviews_topic + '%' || 'N/A'}
          </Text>
          <Text style={[styles.statLabel, darkMode ? styles.textDark : styles.textLight]}>
            Negative
          </Text>
        </View>
      </View>

      <View style={styles.menuBar}>
        {['Summary', 'Analysis'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.menuItem, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.menuText, darkMode ? styles.textDark : styles.textLight]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.contentContainer}>
        {activeTab === 'Summary' ? (
          <Text style={[styles.pageContent, darkMode ? styles.textDark : styles.textLight]}>
            {categoryData?.topic_summary || 'No summary available'}
          </Text>
        ) : (
          // Display analysis images
          <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
            <View style={styles.analysisContainer}>
              {/* Emotion Timeseries */}
              <Text style={styles.imageTitle}>Emotion Timeseries</Text>
              {emotionImage ? (
                <ZoomableImage 
                imageSource={emotionImage} 
                />
              ) : (
                <Text style={styles.fallbackText}>Image for Emotion Timeseries is unavailable</Text>
              )}

              {/* Sentiment Timeseries */}
              <Text style={styles.imageTitle}>Sentiment Timeseries</Text>
              {sentimentImage ? (
                <ZoomableImage 
                imageSource={sentimentImage} 
                />
              ) : (
                <Text style={styles.fallbackText}>Image for Sentiment Timeseries is unavailable</Text>
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1 },
  containerLight: { backgroundColor: '#ffffff' },
  containerDark: { backgroundColor: '#121212' },
  header: { flexDirection: 'row', padding: 20, borderBottomWidth: 1, borderColor: '#ccc' },
  logo: { width: 50, height: 50 },
  moduleInfoContainer: { flex: 1, marginLeft: 10 },
  moduleTitle: { fontSize: 20, fontWeight: 'bold' },
  horizontalContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
  statsContainer: { alignItems: 'center', flex: 1 },
  statNumber: { fontSize: 18, fontWeight: 'bold' },
  statLabel: { fontSize: 14, marginTop: 5 },
  viewingLabel: { fontSize: 20, alignSelf: 'center' },
  menuBar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10 },
  menuItem: { paddingVertical: 10 },
  activeTab: { borderBottomWidth: 2, borderColor: '#007BFF' },
  contentContainer: { flex: 1, padding: 20 },
  pageContent: { fontSize: 16 },
  textLight: { color: '#000' },
  textDark: { color: '#fff' },
  logoutButton: {
    flexDirection: 'row', // Align icon and text horizontally
    alignItems: 'center', // Center the icon and text vertically
    backgroundColor: '#FF6347', // Button color (red or orange)
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 10,
    width: 100,
  },
  logoutIcon: {
    fontSize: 20, // Icon size
    color: '#fff', // Icon color (white)
    marginRight: 10, // Space between icon and text
  },
  logoutText: {
    color: '#fff', // Text color (white)
    fontSize: 12, // Text size
    fontWeight: 'bold', // Bold text
  },  
  buttonText: { fontSize: 14, textAlign: 'center', color: '#fff' },
  analysisContainer: {
    marginTop: 20,
  },
  imageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  analysisImage: {
    width: '100%',
    height: 700,
    marginBottom: 20,
  },
  fallbackText: {
    fontSize: 16,
    color: '#888',
  },
  closeButtonContainer: {
    position: 'absolute', // Position the button absolutely
    top: 40, // Distance from the top of the screen
    right: 20, // Distance from the right of the screen
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Semi-transparent background for modal
  },
});

export default ModuleCategoryScreen;
