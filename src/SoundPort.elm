port module SoundPort exposing (..)


type alias Sound =
    { url : String
    , volume : Float
    }


port playSound : Sound -> Cmd msg
