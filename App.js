import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Button,
} from "react-native";
import Keyboard from "./assets/components/Keyboard";
import { CLEAR, ENTER, colors } from "./assets/constants";
import axios from "react-native-axios";
const NUMBER_OF_TRIES = 6;
const WORD_LENGTH = 5;

const copyArr = (arr) => {
  return [...arr.map((rows) => [...rows])];
};
export default function App() {
  const [wordSpinnerState, setWordSpinnerState] = useState(true);
  const [currentWord, setCurrentWord] = useState("");
  const [gameState, setGameState] = useState("playing");
  const [currentRow, setCurrentRow] = useState(0);
  const [currentColumn, setCurrentColumn] = useState(0);
  const [rows, setRows] = useState(
    new Array(NUMBER_OF_TRIES).fill(new Array(WORD_LENGTH).fill(""))
  );
  console.log(currentWord);
  const getNewWord = () => {
    axios
      .get(
        `https://random-word-api.herokuapp.com/word?number=1&length=${WORD_LENGTH}`
      )
      .then((res) => {
        setCurrentWord(res.data[0]);
        setRows(
          new Array(NUMBER_OF_TRIES).fill(new Array(WORD_LENGTH).fill(""))
        );
        setCurrentRow(0);
        setCurrentColumn(0);
        setGameState("playing");
        setWordSpinnerState(false);
      });
  };
  useEffect(() => {
    getNewWord();
    setWordSpinnerState(false);
  }, []);

  useEffect(() => {
    if (currentRow > 0) {
      checkGameState();
    }
  }, [currentRow]);

  const checkGameState = () => {
    if (checkIfWon()) {
      Alert.alert("Won!");
      setGameState("won");
    } else if (checkIfLost()) {
      Alert.alert("Try Again!");
      setGameState("lost");
    }
  };
  const checkIfWon = () => {
    const row = rows[currentRow - 1];
    return row.every((letter, i) => letter === currentWord[i]);
  };

  const checkIfLost = () => {
    return currentRow === NUMBER_OF_TRIES;
  };

  const isCellActive = (row, col) => {
    return row === currentRow && col === currentColumn;
  };
  const getCellBgColor = (row, col) => {
    const letter = rows[row][col];
    if (row >= currentRow) {
      return colors.black;
    }
    if (letter === currentWord[col]) {
      return colors.primary;
    }
    if (currentWord.includes(letter)) {
      return colors.secondary;
    }
    return colors.darkgrey;
  };
  const handleKeyPress = (key) => {
    if (gameState !== "playing") return;
    const updatedRows = copyArr(rows);

    if (key === CLEAR) {
      const prevCol = currentColumn - 1;
      if (prevCol >= 0) {
        updatedRows[currentRow][currentColumn - 1] = "";
        setRows(updatedRows);
        setCurrentColumn(currentColumn - 1);
      }
      return;
    }
    if (key === ENTER) {
      if (currentColumn === rows[0].length) {
        setCurrentColumn(0);
        setCurrentRow(currentRow + 1);
      }
      return;
    }
    if (currentColumn < rows[0].length) {
      updatedRows[currentRow][currentColumn] = key;
      setRows(updatedRows);
      setCurrentColumn(currentColumn + 1);
    }
  };

  const getAllLettersWithColor = (color) => {
    return rows.flatMap((row, i) =>
      row.filter((cell, j) => getCellBgColor(i, j) === colors[color])
    );
  };

  const handleNewGamePress = () => {
    setWordSpinnerState(true);
    getNewWord();
    setCurrentColumn(0);
    setCurrentRow(0);
  };
  return (
    <SafeAreaView style={styles.outerContainer}>
      {(() => {
        if (wordSpinnerState) {
          return (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" />
              <Text
                style={{
                  marginTop: "5%",
                  color: colors.lightgrey,
                  fontSize: 18,
                  fontWeight: "bold",
                }}
              >
                Loading...
              </Text>
            </View>
          );
        } else {
          return (
            <View style={styles.container}>
              <StatusBar style="light" />
              <Text style={styles.title}>WORDLE</Text>
              <ScrollView style={styles.map}>
                {rows.map((row, i) => (
                  <View key={`row-${i}`} style={styles.row}>
                    {row.map((cell, j) => (
                      <View
                        key={`col-${i}-${j}`}
                        style={[
                          styles.cell,
                          {
                            borderColor: isCellActive(i, j)
                              ? colors.lightgrey
                              : colors.darkgrey,
                            backgroundColor: getCellBgColor(i, j),
                          },
                        ]}
                      >
                        <Text style={styles.letter}>{cell.toUpperCase()}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </ScrollView>
              <View style={styles.newGameButton}>
                <Button
                  color={colors.black}
                  title="New Game"
                  onPress={() => handleNewGamePress()}
                />
              </View>
              <Keyboard
                onKeyPressed={(key) => handleKeyPress(key)}
                greenCaps={getAllLettersWithColor("primary")}
                yellowCaps={getAllLettersWithColor("secondary")}
                greyCaps={getAllLettersWithColor("darkgrey")}
              />
            </View>
          );
        }
      })()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: colors.black,
    height: "100%",
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    backgroundColor: colors.black,
    alignItems: "center",
    paddingTop: "10%",
    paddingBottom: "10%",
  },
  title: {
    color: colors.lightgrey,
    fontSize: 36,
    fontWeight: "bold",
    letterSpacing: 7,
    margin: "5%",
  },
  map: {
    alignSelf: "stretch",
    padding: "2%",
  },
  row: {
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "center",
  },
  cell: {
    justifyContent: "center",
    alignItems: "center",
    borderColor: colors.darkgrey,
    borderWidth: 2,
    borderRadius: 15,
    maxWidth: 65,
    flex: 1,
    aspectRatio: 1,
    margin: 3,
  },
  letter: {
    color: colors.lightgrey,
    fontSize: 32,
    fontWeight: "bold",
  },
  newGameButton: {
    fontWeight: "bold",
    fontSize: 24,
  },
});
