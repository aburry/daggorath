port module LocalStoragePort exposing (..)


type alias SerializedModel =
    { level : Int
    , x : Int
    , y : Int
    , power : Float
    , damage : Float
    , response : String
    , seed : String
    , weight : Float
    , bpm : Float
    , display : String
    , frame : Int
    , heart : String
    , history : List String
    , input : String
    , good : Bool
    , inventory :
        List
            { clazz : String
            , id : Int
            , attack : Float
            , defence : Float
            , magic : Float
            , resistance : Float
            , charges : Int
            , flag : Bool
            , magicLight : Int
            , normalLight : Int
            , power : Float
            , weight : Float
            , adj : String
            , noun : String
            , revealed : Bool
            }
    , leftHand :
        List
            { clazz : String
            , id : Int
            , attack : Float
            , defence : Float
            , magic : Float
            , resistance : Float
            , charges : Int
            , flag : Bool
            , magicLight : Int
            , normalLight : Int
            , power : Float
            , weight : Float
            , adj : String
            , noun : String
            , revealed : Bool
            }
    , rightHand :
        List
            { clazz : String
            , id : Int
            , attack : Float
            , defence : Float
            , magic : Float
            , resistance : Float
            , charges : Int
            , flag : Bool
            , magicLight : Int
            , normalLight : Int
            , power : Float
            , weight : Float
            , adj : String
            , noun : String
            , revealed : Bool
            }
    , status : String
    , orientation : Int
    , monsters :
        List
            { level : Int
            , x : Int
            , y : Int
            , orientation : Int
            , actionCounter : Int
            , inventory :
                List
                    { clazz : String
                    , id : Int
                    , attack : Float
                    , defence : Float
                    , magic : Float
                    , resistance : Float
                    , charges : Int
                    , flag : Bool
                    , magicLight : Int
                    , normalLight : Int
                    , power : Float
                    , weight : Float
                    , adj : String
                    , noun : String
                    , revealed : Bool
                    }
            , statistics :
                { creature : String
                , attack : Float
                , defence : Float
                , magic : Float
                , resistance : Float
                , attackRate : Int
                , moveRate : Int
                , power : Float
                , damage : Float
                }
            }
    , treasure :
        List
            { level : Int
            , x : Int
            , y : Int
            , object :
                { clazz : String
                , id : Int
                , attack : Float
                , defence : Float
                , magic : Float
                , resistance : Float
                , charges : Int
                , flag : Bool
                , magicLight : Int
                , normalLight : Int
                , power : Float
                , weight : Float
                , adj : String
                , noun : String
                , revealed : Bool
                }
            }
    }


port loadCmd : String -> Cmd msg


port loadSub : (SerializedModel -> msg) -> Sub msg


port errorSub : (String -> msg) -> Sub msg


port saveCmd : ( String, SerializedModel ) -> Cmd msg
