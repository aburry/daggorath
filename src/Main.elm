{-
   Original team:
   Douglas J. Morgan, Teamlead
   April Landmeier, Artwork
   Phillip C. Landmeier, Sound and Game Design
   Keith S. Kiyohara, Programmer
   Aran Rice, Testing
   Duncan Cummings, Electrical Engineer
   Jim Thomas, Developer


   William Astle, Dissassembly
   Christopher Cantrell, Dissassembly
   Richard Hunerlach, PC-Port lead
   Tim Lindner, Sound conversion
-}


port module Main exposing (..)

import Array exposing (..)
import Char exposing (..)
import Dict exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Json.Decode exposing (..)
import LocalStoragePort exposing (..)
import Maybe exposing (..)
import Maze exposing (..)
import Random exposing (..)
import Regex exposing (..)
import SoundPort exposing (..)
import Svg exposing (..)
import Svg.Attributes exposing (..)
import Thing exposing (..)
import Time exposing (..)


main : Program Never Model Msg
main =
    Html.program
        { init = init modelStart Cmd.none
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


init : Model -> Cmd msg -> ( Model, Cmd msg )
init model cmd =
    let
        creatures =
            [ --level 0
              { statistics = creature Thing.Spider, level = 0, x = 16, y = 11, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Spider, level = 0, x = 15, y = 5, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Spider, level = 0, x = 29, y = 28, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Spider, level = 0, x = 23, y = 15, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Spider, level = 0, x = 30, y = 3, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Spider, level = 0, x = 8, y = 6, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Spider, level = 0, x = 26, y = 20, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Spider, level = 0, x = 17, y = 26, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Spider, level = 0, x = 21, y = 14, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Viper, level = 0, x = 3, y = 21, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Viper, level = 0, x = 2, y = 19, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Viper, level = 0, x = 21, y = 31, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Viper, level = 0, x = 24, y = 20, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Viper, level = 0, x = 11, y = 31, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Viper, level = 0, x = 30, y = 28, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Viper, level = 0, x = 20, y = 11, orientation = 0, actionCounter = 0, inventory = [ item Thing.WoodenSword 11 ] }
            , { statistics = creature Thing.Viper, level = 0, x = 21, y = 15, orientation = 0, actionCounter = 0, inventory = [ item Thing.LeatherShield 11 ] }
            , { statistics = creature Thing.ClubGiant, level = 0, x = 25, y = 17, orientation = 0, actionCounter = 0, inventory = [ item Thing.PineTorch 11 ] }
            , { statistics = creature Thing.ClubGiant, level = 0, x = 5, y = 28, orientation = 0, actionCounter = 0, inventory = [ item Thing.PineTorch 12 ] }
            , { statistics = creature Thing.ClubGiant, level = 0, x = 15, y = 19, orientation = 0, actionCounter = 0, inventory = [ item Thing.LunarTorch 11 ] }
            , { statistics = creature Thing.ClubGiant, level = 0, x = 2, y = 0, orientation = 0, actionCounter = 0, inventory = [ item Thing.LunarTorch 12 ] }
            , { statistics = creature Thing.Blob, level = 0, x = 3, y = 12, orientation = 0, actionCounter = 0, inventory = [ item Thing.IronSword 11 ] }
            , { statistics = creature Thing.Blob, level = 0, x = 30, y = 20, orientation = 0, actionCounter = 0, inventory = [ item Thing.VulcanRing 11 ] }

            -- level 1
            , { statistics = creature Thing.Spider, level = 1, x = 14, y = 12, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Spider, level = 1, x = 12, y = 18, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Viper, level = 1, x = 6, y = 26, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Viper, level = 1, x = 30, y = 9, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Viper, level = 1, x = 21, y = 9, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Viper, level = 1, x = 17, y = 0, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Blob, level = 1, x = 28, y = 19, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Blob, level = 1, x = 4, y = 12, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Blob, level = 1, x = 14, y = 4, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Blob, level = 1, x = 3, y = 1, orientation = 0, actionCounter = 0, inventory = [ item Thing.WoodenSword 21 ] }
            , { statistics = creature Thing.Blob, level = 1, x = 14, y = 29, orientation = 0, actionCounter = 0, inventory = [ item Thing.IronSword 21 ] }
            , { statistics = creature Thing.Blob, level = 1, x = 10, y = 9, orientation = 0, actionCounter = 0, inventory = [ item Thing.LeatherShield 21 ] }
            , { statistics = creature Thing.Knight, level = 1, x = 26, y = 15, orientation = 0, actionCounter = 0, inventory = [ item Thing.BronzeShield 21 ] }
            , { statistics = creature Thing.Knight, level = 1, x = 7, y = 24, orientation = 0, actionCounter = 0, inventory = [ item Thing.BronzeShield 22 ] }
            , { statistics = creature Thing.Knight, level = 1, x = 24, y = 0, orientation = 0, actionCounter = 0, inventory = [ item Thing.PineTorch 21 ] }
            , { statistics = creature Thing.Knight, level = 1, x = 0, y = 6, orientation = 0, actionCounter = 0, inventory = [ item Thing.PineTorch 22 ] }
            , { statistics = creature Thing.Knight, level = 1, x = 14, y = 25, orientation = 0, actionCounter = 0, inventory = [ item Thing.LunarTorch 21 ] }
            , { statistics = creature Thing.Knight, level = 1, x = 17, y = 4, orientation = 0, actionCounter = 0, inventory = [ item Thing.LunarTorch 22 ] }
            , { statistics = creature Thing.HatchetGiant, level = 1, x = 18, y = 4, orientation = 0, actionCounter = 0, inventory = [ item Thing.SolarTorch 21 ] }
            , { statistics = creature Thing.HatchetGiant, level = 1, x = 19, y = 4, orientation = 0, actionCounter = 0, inventory = [ item Thing.AbyeFlask 21 ] }
            , { statistics = creature Thing.HatchetGiant, level = 1, x = 20, y = 4, orientation = 0, actionCounter = 0, inventory = [ item Thing.AbyeFlask 22 ] }
            , { statistics = creature Thing.HatchetGiant, level = 1, x = 21, y = 4, orientation = 0, actionCounter = 0, inventory = [ item Thing.HaleFlask 21 ] }
            , { statistics = creature Thing.HatchetGiant, level = 1, x = 22, y = 4, orientation = 0, actionCounter = 0, inventory = [ item Thing.VisionScroll 21 ] }
            , { statistics = creature Thing.HatchetGiant, level = 1, x = 23, y = 4, orientation = 0, actionCounter = 0, inventory = [ item Thing.RimeRing 21 ] }

            -- level 2
            , { statistics = creature Thing.Blob, level = 2, x = 1, y = 18, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Blob, level = 2, x = 2, y = 18, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Blob, level = 2, x = 3, y = 18, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Blob, level = 2, x = 4, y = 18, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.HatchetGiant, level = 2, x = 5, y = 18, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.HatchetGiant, level = 2, x = 6, y = 18, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.HatchetGiant, level = 2, x = 7, y = 18, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.HatchetGiant, level = 2, x = 8, y = 18, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.HatchetGiant, level = 2, x = 9, y = 18, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.HatchetGiant, level = 2, x = 10, y = 18, orientation = 0, actionCounter = 0, inventory = [ item Thing.WoodenSword 31 ] }
            , { statistics = creature Thing.Scorpion, level = 2, x = 11, y = 18, orientation = 0, actionCounter = 0, inventory = [ item Thing.IronSword 31 ] }
            , { statistics = creature Thing.Scorpion, level = 2, x = 12, y = 18, orientation = 0, actionCounter = 0, inventory = [ item Thing.LeatherShield 31 ] }
            , { statistics = creature Thing.Scorpion, level = 2, x = 13, y = 18, orientation = 0, actionCounter = 0, inventory = [ item Thing.BronzeShield 31 ] }
            , { statistics = creature Thing.Scorpion, level = 2, x = 14, y = 18, orientation = 0, actionCounter = 0, inventory = [ item Thing.BronzeShield 32 ] }
            , { statistics = creature Thing.Scorpion, level = 2, x = 15, y = 18, orientation = 0, actionCounter = 0, inventory = [ item Thing.PineTorch 31 ] }
            , { statistics = creature Thing.Scorpion, level = 2, x = 16, y = 18, orientation = 0, actionCounter = 0, inventory = [ item Thing.LunarTorch 31 ] }
            , { statistics = creature Thing.Scorpion, level = 2, x = 17, y = 18, orientation = 0, actionCounter = 0, inventory = [ item Thing.AbyeFlask 31 ] }
            , { statistics = creature Thing.Scorpion, level = 2, x = 18, y = 18, orientation = 0, actionCounter = 0, inventory = [ item Thing.AbyeFlask 31 ] }
            , { statistics = creature Thing.ShieldKnight, level = 2, x = 19, y = 18, orientation = 0, actionCounter = 0, inventory = [ item Thing.ThewsFlask 31 ] }
            , { statistics = creature Thing.ShieldKnight, level = 2, x = 20, y = 18, orientation = 0, actionCounter = 0, inventory = [ item Thing.SolarTorch 32 ] }
            , { statistics = creature Thing.ShieldKnight, level = 2, x = 21, y = 18, orientation = 0, actionCounter = 0, inventory = [ item Thing.HaleFlask 31 ] }
            , { statistics = creature Thing.ShieldKnight, level = 2, x = 22, y = 18, orientation = 0, actionCounter = 0, inventory = [ item Thing.VisionScroll 31 ] }
            , { statistics = creature Thing.Demon, level = 2, x = 23, y = 18, orientation = 0, actionCounter = 0, inventory = [ item Thing.SeerScroll 31 ] }

            -- level 3
            , { statistics = creature Thing.Scorpion, level = 3, x = 0, y = 24, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Scorpion, level = 3, x = 2, y = 9, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Scorpion, level = 3, x = 2, y = 14, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Scorpion, level = 3, x = 3, y = 15, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Scorpion, level = 3, x = 4, y = 27, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Scorpion, level = 3, x = 4, y = 24, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Scorpion, level = 3, x = 4, y = 16, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Scorpion, level = 3, x = 6, y = 18, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.ShieldKnight, level = 3, x = 6, y = 9, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.ShieldKnight, level = 3, x = 8, y = 15, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.ShieldKnight, level = 3, x = 10, y = 15, orientation = 0, actionCounter = 0, inventory = [ item Thing.PineTorch 41 ] }
            , { statistics = creature Thing.ShieldKnight, level = 3, x = 11, y = 9, orientation = 0, actionCounter = 0, inventory = [ item Thing.WoodenSword 41 ] }
            , { statistics = creature Thing.ShieldKnight, level = 3, x = 13, y = 9, orientation = 0, actionCounter = 0, inventory = [ item Thing.IronSword 41 ] }
            , { statistics = creature Thing.ShieldKnight, level = 3, x = 15, y = 3, orientation = 0, actionCounter = 0, inventory = [ item Thing.BronzeShield 41 ] }
            , { statistics = creature Thing.Wraith, level = 3, x = 15, y = 13, orientation = 0, actionCounter = 0, inventory = [ item Thing.ThewsFlask 41 ] }
            , { statistics = creature Thing.Wraith, level = 3, x = 15, y = 18, orientation = 0, actionCounter = 0, inventory = [ item Thing.HaleFlask 41 ] }
            , { statistics = creature Thing.Wraith, level = 3, x = 17, y = 30, orientation = 0, actionCounter = 0, inventory = [ item Thing.LunarTorch 41 ] }
            , { statistics = creature Thing.Wraith, level = 3, x = 19, y = 17, orientation = 0, actionCounter = 0, inventory = [ item Thing.SolarTorch 41 ] }
            , { statistics = creature Thing.Wraith, level = 3, x = 19, y = 30, orientation = 0, actionCounter = 0, inventory = [ item Thing.AbyeFlask 41 ] }
            , { statistics = creature Thing.Wraith, level = 3, x = 21, y = 2, orientation = 0, actionCounter = 0, inventory = [ item Thing.MithrilShield 41 ] }
            , { statistics = creature Thing.Galdrog, level = 3, x = 21, y = 26, orientation = 0, actionCounter = 0, inventory = [ item Thing.ElvishSword 41 ] }
            , { statistics = creature Thing.Galdrog, level = 3, x = 24, y = 26, orientation = 0, actionCounter = 0, inventory = [ item Thing.VisionScroll 41 ] }
            , { statistics = creature Thing.Galdrog, level = 3, x = 24, y = 7, orientation = 0, actionCounter = 0, inventory = [ item Thing.SeerScroll 41 ] }
            , { statistics = creature Thing.Galdrog, level = 3, x = 30, y = 20, orientation = 0, actionCounter = 0, inventory = [ item Thing.JouleRing 41 ] }

            -- level 4
            , { statistics = creature Thing.Spider, level = 4, x = 0, y = 21, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Spider, level = 4, x = 1, y = 11, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Viper, level = 4, x = 4, y = 10, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Viper, level = 4, x = 6, y = 31, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.ClubGiant, level = 4, x = 7, y = 5, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.ClubGiant, level = 4, x = 7, y = 14, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Blob, level = 4, x = 8, y = 27, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Blob, level = 4, x = 9, y = 31, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Knight, level = 4, x = 9, y = 0, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Knight, level = 4, x = 9, y = 20, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.HatchetGiant, level = 4, x = 9, y = 28, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.HatchetGiant, level = 4, x = 11, y = 8, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Scorpion, level = 4, x = 15, y = 0, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Scorpion, level = 4, x = 17, y = 9, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.ShieldKnight, level = 4, x = 17, y = 11, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.ShieldKnight, level = 4, x = 18, y = 0, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Wraith, level = 4, x = 20, y = 13, orientation = 0, actionCounter = 0, inventory = [] }
            , { statistics = creature Thing.Wraith, level = 4, x = 20, y = 11, orientation = 0, actionCounter = 0, inventory = [ item Thing.PineTorch 51 ] }
            , { statistics = creature Thing.Galdrog, level = 4, x = 21, y = 18, orientation = 0, actionCounter = 0, inventory = [ item Thing.BronzeShield 51 ] }
            , { statistics = creature Thing.Galdrog, level = 4, x = 21, y = 15, orientation = 0, actionCounter = 0, inventory = [ item Thing.HaleFlask 51 ] }
            , { statistics = creature Thing.Galdrog, level = 4, x = 22, y = 2, orientation = 0, actionCounter = 0, inventory = [ item Thing.AbyeFlask 51 ] }
            , { statistics = creature Thing.Galdrog, level = 4, x = 23, y = 30, orientation = 0, actionCounter = 0, inventory = [ item Thing.SolarTorch 51 ] }
            , { statistics = creature Thing.Galdrog, level = 4, x = 24, y = 7, orientation = 0, actionCounter = 0, inventory = [ item Thing.ThewsFlask 51 ] }
            , { statistics = creature Thing.Galdrog, level = 4, x = 25, y = 11, orientation = 0, actionCounter = 0, inventory = [ item Thing.LunarTorch 51 ] }
            , { statistics = creature Thing.Galdrog, level = 4, x = 28, y = 8, orientation = 0, actionCounter = 0, inventory = [ item Thing.MithrilShield 51 ] }
            , { statistics = creature Thing.Galdrog, level = 4, x = 29, y = 22, orientation = 0, actionCounter = 0, inventory = [ item Thing.SeerScroll 51 ] }
            , { statistics = creature Thing.MoonWizard, level = 4, x = 31, y = 6, orientation = 0, actionCounter = 0, inventory = [ item Thing.SupremeRing 51 ] }
            ]

        treasure =
            []

        inventory =
            [ setRevealed (item Thing.PineTorch 1)
            , setRevealed (item Thing.WoodenSword 2)
            ]
    in
    ( updateBpm
        (updateWeight
            { model
                | monsters = creatures
                , treasure = treasure
                , inventory = inventory
            }
        )
    , cmd
    )



-- SUBSCRIPTIONS and INTEROP


type Msg
    = Command String
    | Tick Time
    | Creatures Time
    | Submit
    | IntroTick Time
    | DeadTick Time
    | FinalTick Time
    | PrepareTick Time
    | IntermissionTick Time
    | Torch Time
    | Load SerializedModel
    | LoadError String


displayIntro model =
    model.display == "intro"


displayPlayerDied model =
    model.status == "dead"


displayWizardDied model =
    List.isEmpty (List.filter (\e -> e.statistics.creature == Thing.MoonWizard) model.monsters)


displayEnding model =
    model.display == "final"


displayPrepare model =
    model.display == "prepare"


displayIntermission model =
    model.display == "intermission"


subscriptions : Model -> Sub Msg
subscriptions model =
    if displayIntro model then
        Sub.batch
            [ Time.every (second / 4) IntroTick
            ]
    else if displayPlayerDied model then
        Sub.batch
            [ Time.every (second / 4) DeadTick
            ]
    else if displayEnding model then
        Sub.batch
            [ Time.every (second / 4) FinalTick
            ]
    else if displayPrepare model then
        Sub.batch
            [ Time.every (second / 4) PrepareTick
            ]
    else if displayIntermission model then
        Sub.batch
            [ Time.every (second / 4) IntermissionTick
            ]
    else if displayWizardDied model then
        Sub.batch
            [ Time.every (Basics.max ((60.0 / model.bpm) * second) (second / 60.0)) Tick
            , loadSub Load
            , errorSub LoadError
            ]
    else
        Sub.batch
            [ Time.every (Basics.max ((60.0 / model.bpm) * second) (second / 60.0)) Tick
            , Time.every (Time.second * 0.25) Creatures
            , Time.every (Time.second * 60) Torch
            , loadSub Load
            , errorSub LoadError
            ]



-- MODEL


type alias Creature =
    { creature : Thing
    , attack : Float
    , defence : Float
    , magic : Float
    , resistance : Float
    , attackRate : Int
    , moveRate : Int
    , power : Float
    , damage : Float
    }


type alias DungeonCreature =
    { level : Int
    , x : Int
    , y : Int
    , orientation : Int
    , actionCounter : Int
    , inventory : List Treasure
    , statistics : Creature
    }


type alias Treasure =
    { class : Thing
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


type alias DungeonTreasure =
    { level : Int
    , x : Int
    , y : Int
    , object : Treasure
    }


type alias Position a =
    { a
        | level : Int
        , x : Int
        , y : Int
    }


type alias Model =
    { level : Int
    , x : Int
    , y : Int
    , power : Float
    , damage : Float
    , response : String
    , seed : Seed
    , weight : Float
    , bpm : Float
    , display : String
    , frame : Int
    , heart : String
    , history : List String
    , input : String
    , good : Bool
    , inventory : List Treasure
    , leftHand : List Treasure
    , rightHand : List Treasure
    , status : String
    , orientation : Int
    , monsters : List DungeonCreature
    , treasure : List DungeonTreasure
    }


modelStart : Model
modelStart =
    { level = 0
    , x = 11
    , y = 16
    , orientation = 0
    , heart = "medium"
    , bpm = 0
    , power = 160
    , damage = 0
    , status = "alive"
    , display = "intro"
    , frame = 0
    , seed = Random.initialSeed 31415
    , weight = 0
    , input = ""
    , response = ""
    , good = False
    , history = List.repeat 3 ""
    , rightHand = [ emptyHand ]
    , leftHand = [ emptyHand ]
    , inventory = []
    , treasure = []
    , monsters = []
    }


setRevealed x =
    { x | revealed = True }


setFlagged x =
    { x | flag = True }


setRightHand model x =
    { model | rightHand = [ x ] }


setLeftHand model x =
    { model | leftHand = [ x ] }


setTreasure model xs =
    { model | treasure = xs }


setInventory model xs =
    { model | inventory = xs }


getLeftHand : Model -> Treasure
getLeftHand model =
    Maybe.withDefault emptyHand (List.head model.leftHand)


getRightHand : Model -> Treasure
getRightHand model =
    Maybe.withDefault emptyHand (List.head model.rightHand)



-- UPDATE


emptyHand : Treasure
emptyHand =
    item Empty 0


isDead model =
    model.power < model.damage


isLitTorch x =
    x.flag && x.class == Thing.Torch


isRevealedScroll x =
    x.revealed && (x.adj == "Vision" || x.adj == "Seer")


isIncantedRing weapon =
    weapon.class == Thing.Ring && 0 < weapon.charges


isEmptyItem obj =
    obj == emptyHand


canReveal x model =
    x.power < model.power


canClimbUp x =
    List.member x [ Maze.Ladder ]


canClimbDown x =
    List.member x [ Maze.Open, Maze.Ladder ]


isFainted model =
    1200 <= model.bpm


isTimeToMove creature =
    creature.statistics.moveRate < creature.actionCounter


isTimeToAttack creature =
    creature.statistics.attackRate < creature.actionCounter


isDeadCreature creature =
    creature.statistics.power <= creature.statistics.damage


equalPosition : Position a -> Position b -> Bool
equalPosition a b =
    ( a.level, a.x, a.y ) == ( b.level, b.x, b.y )


cwTurn : Int -> Int -> Int
cwTurn orient rightTurns =
    (orient + rightTurns) % 4


updateWeight model =
    { model | weight = calcWeight model }


calcBpm model =
    3600 / ((model.power * 64 / (model.power + 2 * model.damage)) - 19)


updateBpm model =
    { model | bpm = calcBpm model }


moveItem : a -> (a -> Model -> Model) -> (a -> Model -> Model) -> Model -> Model
moveItem object remove insert model =
    insert object (remove object model)


long : String -> String -> String -> String -> String
long verb adverb adjective noun =
    String.trim (String.join " " [ verb, adverb, adjective, noun ])


push : a -> List a -> List a
push element queue =
    List.append (List.drop 1 queue) [ element ]


matchPosition : ( Int, Int, Int ) -> List (Position a) -> List (Position a)
matchPosition position xs =
    List.filter (\e -> ( e.level, e.x, e.y ) == position) xs


thereIsAThing : ( Int, Int, Int ) -> List (Position a) -> Bool
thereIsAThing position xs =
    not (List.isEmpty (matchPosition position xs))


hand : String -> { get : Model -> Treasure, set : Model -> Treasure -> Model }
hand adverb =
    case adverb of
        "Right" ->
            { get = getRightHand, set = setRightHand }

        "Left" ->
            { get = getLeftHand, set = setLeftHand }

        _ ->
            { get = \model -> emptyHand, set = \model _ -> model }


uniqPrefixMatch : List String -> String -> String
uniqPrefixMatch xs x =
    -- single match by prefix, or original input
    let
        ciMatch regex =
            Regex.contains (Regex.caseInsensitive (Regex.regex regex))

        matches =
            List.filter (ciMatch ("^" ++ Regex.escape x)) xs
    in
    case matches of
        [ a ] ->
            a

        _ ->
            x


lex : String -> ( Int, String, String, String, String )
lex input =
    let
        words =
            Array.fromList (String.words input)

        get x =
            Maybe.withDefault "" (Array.get x words)

        find vocab pos =
            uniqPrefixMatch vocab (get pos)
    in
    case Array.length words of
        1 ->
            ( 1, find vocab_verb 0, "", "", "" )

        2 ->
            ( 2, find vocab_verb 0, find vocab_adverb 1, "", "" )

        3 ->
            ( 3, find vocab_verb 0, find vocab_adverb 1, "", find vocab_noun 2 )

        4 ->
            ( 4, find vocab_verb 0, find vocab_adverb 1, find vocab_adjective 2, find vocab_noun 3 )

        _ ->
            ( Array.length words, "", "", "", "" )


v_climb : Int -> String -> Model -> ( Model, Cmd msg )
v_climb len adverbs model =
    let
        room =
            Maze.getRoom model.level model.x model.y
    in
    case ( len, adverbs ) of
        ( 2, "Up" ) ->
            if canClimbUp room.ceiling then
                ( { model | good = True, level = model.level - 1, display = "prepare" }, Cmd.none )
            else
                ( { model | good = True }, Cmd.none )

        ( 2, "Down" ) ->
            if canClimbDown room.floor then
                ( { model | good = True, level = model.level + 1, display = "prepare" }, Cmd.none )
            else
                ( { model | good = True }, Cmd.none )

        _ ->
            ( { model | good = False }, Cmd.none )


v_examine len model =
    case len of
        1 ->
            ( { model | good = True, display = "inventory" }, Cmd.none )

        _ ->
            ( { model | good = False }, Cmd.none )


v_incant len adverb model =
    let
        activate ring newring =
            List.map
                (\e ->
                    if e.class == Thing.Ring && e.revealed && e.adj == (item ring 0).adj then
                        item newring e.id
                    else
                        e
                )

        incant ring newring =
            { model
                | rightHand = activate ring newring model.rightHand
                , leftHand = activate ring newring model.leftHand
            }

        action =
            case adverb of
                "Final" ->
                    incant Thing.SupremeRing Thing.FinalRing

                "Energy" ->
                    incant Thing.JouleRing Thing.EnergyRing

                "Ice" ->
                    incant Thing.RimeRing Thing.IceRing

                "Fire" ->
                    incant Thing.VulcanRing Thing.FireRing

                _ ->
                    model

        endGame model =
            let
                final =
                    List.filter (\e -> e.adj == "Final") (List.concat [ model.leftHand, model.rightHand ])
            in
            if List.isEmpty final then
                model
            else
                { model | display = "final", frame = 0 }

        final =
            endGame action
    in
    case len of
        2 ->
            ( { final | good = True }, Cmd.none )

        _ ->
            ( { model | good = False }, Cmd.none )


v_look len adverbs model =
    case len of
        1 ->
            ( { model | good = True, display = "dungeon" }, Cmd.none )

        _ ->
            ( { model | good = False }, Cmd.none )


eval : ( Int, String, String, String, String ) -> Model -> ( Model, Cmd msg )
eval ( len, verbs, adverbs, adjectives, nouns ) model =
    case verbs of
        "Attack" ->
            v_attack len adverbs model

        "Climb" ->
            v_climb len adverbs model

        "Drop" ->
            v_drop len adverbs model

        "Examine" ->
            v_examine len model

        "Get" ->
            v_get len adverbs adjectives nouns model

        "Incant" ->
            v_incant len adverbs model

        "Look" ->
            v_look len adverbs model

        "Move" ->
            v_move len adverbs model

        "Pull" ->
            v_pull len adverbs adjectives nouns model

        "Reveal" ->
            v_reveal len adverbs model

        "Stow" ->
            v_stow len adverbs model

        "Turn" ->
            v_turn len adverbs model

        "Use" ->
            v_use len adverbs adjectives nouns model

        "Zsave" ->
            v_zsave len adverbs adjectives nouns model

        "Zload" ->
            v_zload len adverbs adjectives nouns model

        _ ->
            ( { model | good = False }, Cmd.none )


useTorch : Int -> String -> String -> String -> Model -> ( Model, Cmd msg )
useTorch len adverbs adjectives nouns model =
    let
        source =
            hand adverbs

        object =
            source.get model

        remove object model =
            source.set model emptyHand

        insert object model =
            { model
                | inventory =
                    List.append
                        (List.map
                            (\e ->
                                if isLitTorch e then
                                    { e | flag = False }
                                else
                                    e
                            )
                            model.inventory
                        )
                        [ object ]
            }

        action model =
            moveItem { object | flag = True } remove insert model
    in
    ( action model, playSound { url = sound Thing.Torch, volume = 1.0 } )


deserialize : SerializedModel -> Model
deserialize data =
    let
        translateCreature c =
            { creature = deserializeThing c.creature
            , attack = c.attack
            , defence = c.defence
            , magic = c.magic
            , resistance = c.resistance
            , attackRate = c.attackRate
            , moveRate = c.moveRate
            , power = c.power
            , damage = c.damage
            }

        translateDungeonCreature c =
            { level = c.level
            , x = c.x
            , y = c.y
            , orientation = c.orientation
            , actionCounter = c.actionCounter
            , inventory = List.map translateTreasure c.inventory
            , statistics = translateCreature c.statistics
            }

        translateTreasure t =
            { class = deserializeThing t.clazz
            , id = t.id
            , attack = t.attack
            , defence = t.defence
            , magic = t.magic
            , resistance = t.resistance
            , charges = t.charges
            , flag = t.flag
            , magicLight = t.magicLight
            , normalLight = t.normalLight
            , power = t.power
            , weight = t.weight
            , adj = t.adj
            , noun = t.noun
            , revealed = t.revealed
            }

        translateDungeonTreasure t =
            { level = t.level
            , x = t.x
            , y = t.y
            , object = translateTreasure t.object
            }

        translate m =
            { level = m.level
            , x = m.x
            , y = m.y
            , power = m.power
            , damage = m.damage
            , response = m.response
            , seed = Random.initialSeed 31415
            , weight = m.weight
            , bpm = m.bpm
            , display = m.display
            , frame = m.frame
            , heart = m.heart
            , history = m.history
            , input = m.input
            , good = m.good
            , status = m.status
            , orientation = m.orientation
            , inventory = List.map translateTreasure m.inventory
            , leftHand = List.map translateTreasure m.leftHand
            , rightHand = List.map translateTreasure m.rightHand
            , monsters = List.map translateDungeonCreature m.monsters
            , treasure = List.map translateDungeonTreasure m.treasure
            }
    in
    translate data


serialize : Model -> SerializedModel
serialize model =
    let
        serializeCreature c =
            { creature = serializeThing c.creature
            , attack = c.attack
            , defence = c.defence
            , magic = c.magic
            , resistance = c.resistance
            , attackRate = c.attackRate
            , moveRate = c.moveRate
            , power = c.power
            , damage = c.damage
            }

        serializeDungeonCreature c =
            { level = c.level
            , x = c.x
            , y = c.y
            , orientation = c.orientation
            , actionCounter = c.actionCounter
            , inventory = List.map serializeTreasure c.inventory
            , statistics = serializeCreature c.statistics
            }

        serializeTreasure t =
            { clazz = serializeThing t.class
            , id = t.id
            , attack = t.attack
            , defence = t.defence
            , magic = t.magic
            , resistance = t.resistance
            , charges = t.charges
            , flag = t.flag
            , magicLight = t.magicLight
            , normalLight = t.normalLight
            , power = t.power
            , weight = t.weight
            , adj = t.adj
            , noun = t.noun
            , revealed = t.revealed
            }

        serializeDungeonTreasure t =
            { level = t.level
            , x = t.x
            , y = t.y
            , object = serializeTreasure t.object
            }

        translate m =
            { level = m.level
            , x = m.x
            , y = m.y
            , power = m.power
            , damage = m.damage
            , response = m.response
            , seed = ""
            , weight = m.weight
            , bpm = m.bpm
            , display = m.display
            , frame = m.frame
            , heart = m.heart
            , history = m.history
            , input = m.input
            , good = m.good
            , inventory = List.map serializeTreasure m.inventory
            , leftHand = List.map serializeTreasure m.leftHand
            , rightHand = List.map serializeTreasure m.rightHand
            , status = m.status
            , orientation = m.orientation
            , monsters = List.map serializeDungeonCreature m.monsters
            , treasure = List.map serializeDungeonTreasure m.treasure
            }
    in
    translate model


v_zsave : Int -> String -> String -> String -> Model -> ( Model, Cmd msg )
v_zsave len adverb adjectives nouns model =
    if adverb /= "" then
        ( { model | good = True }, saveCmd ( String.toLower adverb, serialize model ) )
    else
        ( model, Cmd.none )


v_zload len adverb adjectives nouns model =
    if adverb /= "" then
        ( { model | good = True }, loadCmd (String.toLower adverb) )
    else
        ( model, Cmd.none )


useScroll object model =
    if isRevealedScroll object then
        ( { model | display = String.toLower object.adj }, playSound { url = sound Scroll, volume = 1.0 } )
    else
        ( model, playSound { url = sound Scroll, volume = 1.0 } )


useFlask adverbs model =
    let
        target =
            hand adverbs

        obj =
            target.get model

        modelp =
            case obj.adj of
                "Abye" ->
                    { model | damage = model.damage + 0.8 * model.power }

                "Hale" ->
                    { model | damage = 0 }

                "Thews" ->
                    { model | power = model.power + 1000 }

                _ ->
                    model

        modelq =
            target.set modelp (item Thing.EmptyFlask obj.id)
    in
    ( modelq, playSound { url = sound Flask, volume = 1.0 } )


v_use : Int -> String -> String -> String -> Model -> ( Model, Cmd msg )
v_use len adverbs adjectives nouns model =
    let
        target =
            hand adverbs

        obj =
            target.get model

        action nouns model =
            case (target.get model).noun of
                "Torch" ->
                    case obj.adj of
                        "Dead" ->
                            useTorch len adverbs adjectives nouns model

                        "Pine" ->
                            useTorch len adverbs adjectives nouns model

                        "Lunar" ->
                            useTorch len adverbs adjectives nouns model

                        "Solar" ->
                            useTorch len adverbs adjectives nouns model

                        _ ->
                            ( model, Cmd.none )

                "Scroll" ->
                    case obj.adj of
                        "Vision" ->
                            useScroll obj model

                        "Seer" ->
                            useScroll obj model

                        _ ->
                            ( model, Cmd.none )

                "Flask" ->
                    case obj.adj of
                        "Abye" ->
                            useFlask adverbs model

                        "Hale" ->
                            useFlask adverbs model

                        "Thews" ->
                            useFlask adverbs model

                        _ ->
                            ( model, Cmd.none )

                _ ->
                    ( { model | good = False }, Cmd.none )
    in
    case ( len, adverbs ) of
        ( 2, "Left" ) ->
            action nouns { model | good = True }

        ( 2, "Right" ) ->
            action nouns { model | good = True }

        _ ->
            ( { model | good = False }, Cmd.none )


v_reveal : Int -> String -> Model -> ( Model, Cmd msg )
v_reveal len adverbs model =
    let
        target =
            hand adverbs

        reveal x =
            if canReveal x model then
                setRevealed x
            else
                x

        action model =
            ( target.set model (reveal (target.get model))
            , Cmd.none
            )
    in
    case ( len, adverbs ) of
        ( 2, "Right" ) ->
            action { model | good = True }

        ( 2, "Left" ) ->
            action { model | good = True }

        _ ->
            ( { model | good = False }, Cmd.none )


v_drop : Int -> String -> Model -> ( Model, Cmd msg )
v_drop len adverbs model =
    let
        source =
            hand adverbs

        obj =
            source.get model

        remove object model =
            updateWeight (source.set model emptyHand)

        insert object model =
            { model | treasure = { level = model.level, x = model.x, y = model.y, object = object } :: model.treasure }

        action model =
            moveItem obj remove insert model
    in
    case ( len, adverbs ) of
        ( 2, "Right" ) ->
            if isEmptyItem obj then
                ( { model | good = True, response = " ???" }, Cmd.none )
            else
                ( action { model | good = True }, Cmd.none )

        ( 2, "Left" ) ->
            if isEmptyItem obj then
                ( { model | good = True, response = " ???" }, Cmd.none )
            else
                ( action { model | good = True }, Cmd.none )

        _ ->
            ( { model | good = False }, Cmd.none )


v_stow : Int -> String -> Model -> ( Model, Cmd msg )
v_stow len adverbs model =
    let
        source =
            hand adverbs

        obj =
            source.get model

        remove object model =
            source.set model emptyHand

        insert object model =
            { model | inventory = object :: model.inventory }

        action model =
            moveItem obj remove insert model
    in
    case ( len, adverbs ) of
        ( 2, "Right" ) ->
            if isEmptyItem obj then
                ( { model | good = True, response = " ???" }, Cmd.none )
            else
                ( action { model | good = True }, Cmd.none )

        ( 2, "Left" ) ->
            if isEmptyItem obj then
                ( { model | good = True, response = " ???" }, Cmd.none )
            else
                ( action { model | good = True }, Cmd.none )

        _ ->
            ( { model | good = False }, Cmd.none )


calcWeight model =
    (if 2 < model.level then
        200
     else
        0
    )
        + List.sum
            (List.concat
                [ List.map .weight model.leftHand
                , List.map .weight model.rightHand
                , List.map .weight model.inventory
                ]
            )


v_get : Int -> String -> String -> String -> Model -> ( Model, Cmd msg )
v_get len adverbs adjectives nouns model =
    let
        target =
            hand adverbs

        object =
            Maybe.withDefault { level = 0, x = 0, y = 0, object = emptyHand } (findFirst (match adjectives nouns model) model.treasure)

        handFull =
            target.get model /= emptyHand

        remove object model =
            { model | treasure = List.filter ((/=) object) model.treasure }

        insert object model =
            updateWeight (target.set model object.object)

        match adj noun model obj =
            obj.object.noun == noun && equalPosition obj model && (adj == "" || (obj.object.adj == adj && obj.object.revealed))

        action model =
            moveItem object remove insert model

        exec =
            if handFull then
                ( { model | good = True, response = " ???" }, Cmd.none )
            else
                ( action { model | good = True }, Cmd.none )
    in
    case ( len, adverbs, adjectives, nouns ) of
        ( 3, "Left", "", _ ) ->
            exec

        ( 4, "Left", _, _ ) ->
            exec

        ( 3, "Right", "", _ ) ->
            exec

        ( 4, "Right", _, _ ) ->
            exec

        _ ->
            ( { model | good = False }, Cmd.none )


v_pull : Int -> String -> String -> String -> Model -> ( Model, Cmd msg )
v_pull len adverbs adjectives nouns model =
    let
        target =
            hand adverbs

        handFull =
            target.get model /= emptyHand

        remove object model =
            { model | inventory = List.filter ((/=) object) model.inventory }

        insert object model =
            target.set model
                (if isLitTorch object then
                    { object | flag = False }
                 else
                    object
                )

        match adj noun model obj =
            obj.noun == noun && (adj == "" || (obj.adj == adj && obj.revealed))

        action model =
            moveItem object remove insert model

        object =
            Maybe.withDefault emptyHand (findFirst (match adjectives nouns model) model.inventory)

        exec =
            if handFull then
                ( { model | good = True, response = " ???" }, Cmd.none )
            else
                ( action { model | good = True }, Cmd.none )
    in
    case ( len, adverbs, adjectives, nouns ) of
        ( 3, "Left", "", _ ) ->
            exec

        ( 4, "Left", _, _ ) ->
            exec

        ( 3, "Right", "", _ ) ->
            exec

        ( 4, "Right", _, _ ) ->
            exec

        _ ->
            ( { model | good = False }, Cmd.none )


calcDamage : Float -> Float -> Float -> Float -> Float -> Float
calcDamage attackerPower attackerMagicalOffence defenderMagicalDefence attackerPhysicalOffence defenderPhysicalDefence =
    attackerPower * (attackerMagicalOffence * defenderMagicalDefence + attackerPhysicalOffence * defenderPhysicalDefence) / (128 * 128)


damageCreature : Model -> Float -> DungeonCreature -> DungeonCreature
damageCreature model damage ({ statistics } as monster) =
    if equalPosition model monster then
        { monster | statistics = { statistics | damage = statistics.damage + damage } }
    else
        monster


calcDefence model =
    { resistance = Basics.min (getLeftHand model).resistance (getRightHand model).resistance
    , defence = Basics.min (getLeftHand model).defence (getRightHand model).defence
    }


consumeRingCharge weapon =
    if isIncantedRing weapon then
        if 1 < weapon.charges then
            { weapon | charges = weapon.charges - 1 }
        else
            item Thing.GoldRing weapon.id
    else
        weapon


v_attack : Int -> String -> Model -> ( Model, Cmd msg )
v_attack len adverbs model =
    let
        ( model1, isHit ) =
            randomHit model m.statistics.power m.statistics.damage model.power

        ( rnd, seed2 ) =
            Random.step (Random.int 0 255) model1.seed

        isHailMaryHit =
            rnd < 64

        workingTorch =
            0 < List.length (List.filter (\e -> isLitTorch e && e.adj /= "Dead") model.inventory)

        target =
            hand adverbs

        weapon =
            target.get model

        monster =
            List.filter (equalPosition model) model.monsters

        selfDamage =
            model.power * (weapon.attack + weapon.magic) / 8 / 128

        m =
            Maybe.withDefault { level = 0, x = 0, y = 0, orientation = 0, actionCounter = 0, statistics = creature Spider, inventory = [] } (List.head monster)

        damage =
            if List.isEmpty monster then
                0
            else if isIncantedRing weapon then
                calcDamage model.power weapon.magic m.statistics.resistance weapon.attack m.statistics.defence
            else if workingTorch && isHit then
                calcDamage model.power weapon.magic m.statistics.resistance weapon.attack m.statistics.defence
            else if not workingTorch && isHailMaryHit then
                calcDamage model.power weapon.magic m.statistics.resistance weapon.attack m.statistics.defence
            else
                0

        damagedCreature =
            damageCreature model damage m

        model2 =
            target.set
                { model
                    | good = True
                    , seed = seed2
                    , response = " !!!"
                    , damage = model.damage + selfDamage
                }
                (consumeRingCharge weapon)
    in
    case monster of
        [ m ] ->
            if isDeadCreature damagedCreature then
                ( gotoLevelFour
                    { model2
                        | monsters = List.filter (\e -> not (equalPosition model e)) model.monsters
                        , treasure = List.append model.treasure (List.map (\e -> { level = model.level, x = model.x, y = model.y, object = e }) m.inventory)
                        , power = model.power + 1 / 8 * m.statistics.power
                    }
                    damagedCreature
                , Cmd.batch [ playSound { url = sound weapon.class, volume = 1.0 }, playSound { url = sound PlayerHitCreature, volume = 1.0 }, playSound { url = sound CreatureDied, volume = 1.0 } ]
                )
            else
                ( { model2 | monsters = List.map (damageCreature model damage) model.monsters }
                , Cmd.batch [ playSound { url = sound weapon.class, volume = 1.0 }, playSound { url = sound PlayerHitCreature, volume = 1.0 } ]
                )

        _ ->
            ( { model2 | response = "" }, playSound { url = sound weapon.class, volume = 1.0 } )


gotoLevelFour model creature =
    let
        emptyInventory inventory =
            List.filter isLitTorch inventory
    in
    if creature.statistics.creature /= Thing.Demon then
        model
    else
        { model
            | level = 3
            , x = 10
            , y = 16
            , display = "intermission"
            , inventory = emptyInventory model.inventory
        }


randomHit model defenderPower defenderDamage attackerPower =
    let
        effectiveDefenderPower =
            -- [0, 3.75] * attackerPower
            Basics.min (3.75 * attackerPower) (defenderPower - defenderDamage)

        norm =
            -- [-0.75, 3]
            3 - effectiveDefenderPower / attackerPower

        threshold =
            if 0 < norm then
                127 - 40 * norm
            else
                127 - 100 * norm

        ( rnd, seed1 ) =
            Random.step (Random.int 0 255) model.seed

        isHit =
            truncate threshold <= rnd
    in
    ( { model | seed = seed1 }, isHit )


creatureAttacks : DungeonCreature -> ( Model, Cmd msg ) -> ( Model, Cmd msg )
creatureAttacks creature ( model, cmd ) =
    let
        ( model1, isHit ) =
            randomHit model model.power model.damage creature.statistics.power

        damage =
            if isHit then
                calcDamage creature.statistics.power creature.statistics.magic (calcDefence model).resistance creature.statistics.attack (calcDefence model).defence
            else
                0

        monsters =
            creature :: List.filter (\e -> not (equalPosition creature e)) model.monsters

        snd =
            Cmd.batch [ cmd, playSound { url = sound creature.statistics.creature, volume = 1.0 } ]
    in
    ( { model | seed = model1.seed, monsters = monsters, damage = model.damage + damage }, snd )


v_move len adverbs model =
    let
        mv delta =
            step model.level model.x model.y (cwTurn model.orientation delta)

        ( nx, ny ) =
            case adverbs of
                "" ->
                    mv 0

                "Right" ->
                    mv 1

                "Back" ->
                    mv 2

                "Left" ->
                    mv -1

                _ ->
                    ( model.x, model.y )

        cmd =
            if ( model.x, model.y ) == ( nx, ny ) then
                playSound { url = sound PlayerHitWall, volume = 1.0 }
            else
                Cmd.none

        damage =
            model.damage + model.weight / 8 + 3

        ret =
            ( { model | good = True, x = nx, y = ny, damage = damage }, cmd )
    in
    case ( len, adverbs ) of
        ( 1, "" ) ->
            ret

        ( 2, "Right" ) ->
            ret

        ( 2, "Left" ) ->
            ret

        ( 2, "Back" ) ->
            ret

        _ ->
            ( { model | good = False }, cmd )


findFirst : (a -> Bool) -> List a -> Maybe a
findFirst predicate xs =
    case xs of
        [] ->
            Maybe.Nothing

        head :: rest ->
            if predicate head then
                Maybe.Just head
            else
                findFirst predicate rest


v_turn len adverbs model =
    let
        action delta =
            ( { model | good = True, orientation = cwTurn model.orientation delta }, Cmd.none )
    in
    case ( len, adverbs ) of
        ( 2, "Right" ) ->
            action 1

        ( 2, "Left" ) ->
            action -1

        ( 2, "Around" ) ->
            action 2

        _ ->
            ( { model | good = False }, Cmd.none )


parse : Model -> ( Model, Cmd msg )
parse model =
    let
        ( len, verb, adverb, adjective, noun ) =
            lex model.input

        ( modelp, cmd ) =
            eval ( len, verb, adverb, adjective, noun ) model

        interpretation =
            if modelp.good then
                long verb adverb adjective noun ++ modelp.response
            else
                modelp.input ++ " ???"
    in
    ( { modelp | input = "", response = "", history = push interpretation modelp.history }, cmd )


updateHeart model =
    let
        bpm =
            calcBpm model

        toggleHeart =
            if model.heart == "xx-small" then
                "medium"
            else
                "xx-small"

        status =
            if isDead model then
                "dead"
            else if isFainted model then
                "fainted"
            else
                "alive"
    in
    ( { model
        | heart = toggleHeart
        , damage = model.damage * (63 / 64)
        , bpm = bpm
        , status = status
      }
    , playSound { url = sound Heart, volume = 0.25 }
    )


updateTorch : Model -> ( Model, Cmd msg )
updateTorch model =
    let
        consumeTorch object =
            if isLitTorch object && 0 < object.charges then
                { object
                    | adj =
                        if object.charges < 7 then
                            "Dead"
                        else
                            object.adj
                    , normalLight = Basics.min (object.charges - 1) object.normalLight
                    , magicLight = Basics.min (object.charges - 1) object.magicLight
                    , charges = object.charges - 1
                    , revealed =
                        if object.charges < 7 then
                            True
                        else
                            object.revealed
                }
            else
                object
    in
    ( { model | inventory = List.map consumeTorch model.inventory }, Cmd.none )


loadError history =
    List.indexedMap
        (\n e ->
            if n == (List.length history - 1) then
                e ++ " ???"
            else
                e
        )
        history


update : Msg -> Model -> ( Model, Cmd msg )
update msg model =
    case msg of
        Command str ->
            ( { model | input = str }, Cmd.none )

        Tick newTime ->
            updateHeart model

        Torch newTime ->
            updateTorch model

        Submit ->
            parse model

        Creatures newTime ->
            updateCreatures model

        Load data ->
            ( deserialize data, Cmd.none )

        LoadError str ->
            ( { model | history = loadError model.history }, Cmd.none )

        PrepareTick newTime ->
            if model.frame < 16 then
                ( { model | frame = model.frame + 1 }, Cmd.none )
            else
                ( { model | display = "dungeon", frame = 0 }, Cmd.none )

        IntroTick newTime ->
            if model.frame < 16 then
                ( { model | frame = model.frame + 1 }
                , if (model.frame % 4) == 0 then
                    playSound { url = sound WizardFadeBuzz, volume = toFloat model.frame / 15.0 }
                  else
                    Cmd.none
                )
            else if model.frame == 16 then
                ( { model | frame = model.frame + 1 }, playSound { url = sound WizardFadeCrash, volume = 1.0 } )
            else if model.frame < 32 then
                ( { model | frame = model.frame + 1 }, Cmd.none )
            else if model.frame == 32 then
                ( { model | frame = model.frame + 1 }, playSound { url = sound WizardFadeCrash, volume = 1.0 } )
            else if model.frame < 48 then
                ( { model | frame = model.frame + 1 }
                , if (model.frame % 4) == 0 then
                    playSound { url = sound WizardFadeBuzz, volume = 1.0 - (toFloat (model.frame - 33) / 15.0) }
                  else
                    Cmd.none
                )
            else
                ( { model | display = "prepare", frame = 0 }, Cmd.none )

        DeadTick newTime ->
            if model.frame < 16 then
                ( { model | frame = model.frame + 1 }
                , if (model.frame % 4) == 0 then
                    playSound { url = sound WizardFadeBuzz, volume = toFloat model.frame / 15.0 }
                  else
                    Cmd.none
                )
            else if model.frame == 16 then
                ( { model | frame = model.frame + 1 }, playSound { url = sound WizardFadeCrash, volume = 1.0 } )
            else if model.frame < 32 then
                ( { model | frame = model.frame + 1 }, Cmd.none )
            else
                init { modelStart | display = "dungeon", frame = 0 } Cmd.none

        FinalTick newTime ->
            if model.frame < 16 then
                ( { model | frame = model.frame + 1 }
                , if (model.frame % 4) == 0 then
                    playSound { url = sound WizardFadeBuzz, volume = toFloat model.frame / 15.0 }
                  else
                    Cmd.none
                )
            else if model.frame == 16 then
                ( { model | frame = model.frame + 1 }, playSound { url = sound WizardFadeCrash, volume = 1.0 } )
            else
                --model.frame < 32 then
                ( { model | frame = model.frame + 1 }, Cmd.none )

        IntermissionTick newTime ->
            if model.frame < 16 then
                ( { model | frame = model.frame + 1 }
                , if (model.frame % 4) == 0 then
                    playSound { url = sound WizardFadeBuzz, volume = toFloat model.frame / 15.0 }
                  else
                    Cmd.none
                )
            else if model.frame == 16 then
                ( { model | frame = model.frame + 1 }, playSound { url = sound WizardFadeCrash, volume = 1.0 } )
            else if model.frame < 32 then
                ( { model | frame = model.frame + 1 }, Cmd.none )
            else if model.frame == 32 then
                ( { model | frame = model.frame + 1 }, playSound { url = sound WizardFadeCrash, volume = 1.0 } )
            else if model.frame < 48 then
                ( { model | frame = model.frame + 1 }
                , if (model.frame % 4) == 0 then
                    playSound { url = sound WizardFadeBuzz, volume = 1.0 - (toFloat (model.frame - 33) / 15.0) }
                  else
                    Cmd.none
                )
            else
                ( { model | display = "prepare", frame = 0 }, Cmd.none )


solid =
    { north = Maze.Solid
    , east = Maze.Solid
    , south = Maze.Solid
    , west = Maze.Solid
    , floor = Maze.Solid
    , ceiling = Maze.Solid
    }


sndCreature ( model, cmd ) creature =
    let
        ( randomNoise, seed1 ) =
            Random.step (Random.int 0 1) model.seed

        ( dx, dy ) =
            ( abs (model.x - creature.x), abs (model.y - creature.y) )

        distance =
            if (dx < 9 && dy < 9) && not (2 < dx && 2 < dy) then
                Basics.max dx dy
            else
                9

        vol =
            (9.0 - toFloat distance) / 9.0
    in
    if model.level == creature.level && distance < 9 && randomNoise == 1 then
        ( { model | seed = seed1 }, Cmd.batch [ cmd, playSound { url = sound creature.statistics.creature, volume = vol } ] )
    else
        ( { model | seed = seed1 }, cmd )


moveCreature : DungeonCreature -> ( Model, Cmd msg ) -> ( Model, Cmd msg )
moveCreature creature ( model, cmd ) =
    let
        relRoomCalc x y orientation =
            absRoom2relRoom (Maze.getRoom creature.level x y) orientation

        relRoom =
            relRoomCalc creature.x creature.y creature.orientation

        choices =
            List.filter (\e -> e.wall /= Maze.Solid)
                ({ wall = relRoom.left, turn = -1 }
                    :: { wall = relRoom.front, turn = 0 }
                    :: { wall = relRoom.right, turn = 1 }
                    :: { wall = relRoom.back, turn = 2 }
                    :: []
                )

        seek ( x, y ) orientation seeSomething =
            if seeSomething ( x, y ) then
                True
            else if (relRoomCalc x y orientation).front == Maze.Solid then
                False
            else
                seek (step creature.level x y orientation) orientation seeSomething

        findMonster turn =
            let
                ( mx, my ) =
                    step creature.level creature.x creature.y (cwTurn creature.orientation turn)
            in
            thereIsAThing ( creature.level, mx, my ) model.monsters

        findPlayer turn =
            seek ( creature.x, creature.y )
                (cwTurn creature.orientation turn)
                (\( x, y ) -> ( creature.level, x, y ) == ( model.level, model.x, model.y ))

        findTreasure turn =
            seek ( creature.x, creature.y )
                (cwTurn creature.orientation turn)
                (\( x, y ) -> thereIsAThing ( creature.level, x, y ) model.treasure)

        randomChoice choices =
            let
                ( rnd, seed1 ) =
                    Random.step (Random.int 0 (List.length choices - 1)) model.seed
            in
            ( (Maybe.withDefault { wall = Maze.Open, turn = 2 } (Array.get rnd (Array.fromList choices))).turn, seed1 )

        ( direction, seed1 ) =
            let
                player =
                    List.filter (\e -> findPlayer e.turn) choices

                treasure =
                    List.filter (\e -> findTreasure e.turn) choices

                nomonsters =
                    List.filter (\e -> not (findMonster e.turn)) choices
            in
            if not (List.isEmpty player) then
                randomChoice player
            else if not (List.isEmpty treasure) then
                randomChoice treasure
            else
                randomChoice
                    (if List.length nomonsters < 2 then
                        nomonsters
                     else
                        List.filter (\e -> e.turn /= 2) nomonsters
                    )

        ( nx, ny ) =
            step creature.level creature.x creature.y (cwTurn creature.orientation direction)

        ( xx, yy ) =
            if List.isEmpty (matchPosition ( creature.level, nx, ny ) model.monsters) then
                ( nx, ny )
            else
                ( creature.x, creature.y )

        ncreature =
            { creature | x = xx, y = yy, orientation = cwTurn creature.orientation direction }

        monsters =
            ncreature :: List.filter (\e -> not (equalPosition creature e)) model.monsters
    in
    sndCreature ( { model | seed = seed1, monsters = monsters }, cmd ) ncreature


treasureCreature : DungeonCreature -> ( Model, Cmd msg ) -> ( Model, Cmd msg )
treasureCreature creature ( model, cmd ) =
    let
        treasure =
            findFirst (equalPosition creature) model.treasure

        treasure1 =
            List.filter ((/=) (Maybe.withDefault { level = 0, x = 0, y = 0, object = emptyHand } treasure)) model.treasure

        ncreature =
            { creature | inventory = (Maybe.withDefault { level = 0, x = 0, y = 0, object = emptyHand } treasure).object :: creature.inventory }

        monsters =
            ncreature :: List.filter (\e -> not (equalPosition creature e)) model.monsters
    in
    ( { model | treasure = treasure1, monsters = monsters }, cmd )


updateCreature : DungeonCreature -> ( Model, Cmd msg ) -> ( Model, Cmd msg )
updateCreature creature ( model, cmd ) =
    let
        treasure =
            findFirst (equalPosition creature) model.treasure

        player =
            equalPosition model creature

        action =
            if treasure /= Maybe.Nothing && not (List.member creature.statistics.creature [ Thing.Scorpion, Thing.MoonWizard, Thing.Demon ]) then
                "treasure"
            else if player then
                "attack"
            else
                "move"
    in
    case action of
        "treasure" ->
            if isTimeToAttack creature then
                treasureCreature { creature | actionCounter = 0 } ( model, cmd )
            else
                ( model, cmd )

        "attack" ->
            if isTimeToAttack creature then
                creatureAttacks { creature | actionCounter = 0 } ( model, cmd )
            else
                ( model, cmd )

        "move" ->
            if isTimeToMove creature then
                moveCreature { creature | actionCounter = 0 } ( model, cmd )
            else
                ( model, cmd )

        _ ->
            ( model, cmd )


updateCreatures : Model -> ( Model, Cmd msg )
updateCreatures model =
    let
        creatures_a =
            List.map
                (\e -> { e | actionCounter = e.actionCounter + 1 })
                model.monsters

        ( nmodel, ncmd ) =
            List.foldl
                (\e ( m, c ) -> updateCreature e ( m, c ))
                ( { model | monsters = creatures_a }, Cmd.none )
                creatures_a
    in
    if model.damage < nmodel.damage then
        ( nmodel, Cmd.batch [ ncmd, playSound { url = sound CreatureHitPlayer, volume = 1.0 } ] )
    else
        ( nmodel, ncmd )



-- VIEW


distance : Float -> String
distance d =
    let
        scale =
            ((192 - 64) / (229 - 27)) ^ (d - 1)

        dx =
            toString (256 * (1 - scale) / 2)

        dy =
            toString (152 * (1 - scale) / 2)

        s =
            toString scale
    in
    String.concat [ "translate(", dx, " ", dy, ") scale(", s, ")" ]


step : Int -> Int -> Int -> Int -> ( Int, Int )
step level x y d =
    let
        ( nx, ny ) =
            case d of
                0 ->
                    ( x, Basics.max 0 (y - 1) )

                1 ->
                    ( Basics.min 31 (x + 1), y )

                2 ->
                    ( x, Basics.min 31 (y + 1) )

                3 ->
                    ( Basics.max 0 (x - 1), y )

                _ ->
                    ( x, y )

        relativeRoom =
            absRoom2relRoom (Maze.getRoom level x y) d
    in
    if relativeRoom.front == Maze.Solid then
        ( x, y )
    else
        ( nx, ny )


type alias RelativeRoom =
    { left : Maze.Feature
    , front : Maze.Feature
    , right : Maze.Feature
    , back : Maze.Feature
    , floor : Maze.Feature
    , ceiling : Maze.Feature
    }


absRoom2relRoom : Maze.Room -> Int -> RelativeRoom
absRoom2relRoom room orientation =
    let
        ( left, front, right, back, floor, ceiling ) =
            case orientation of
                1 ->
                    ( .north, .east, .south, .west, .floor, .ceiling )

                2 ->
                    ( .east, .south, .west, .north, .floor, .ceiling )

                3 ->
                    ( .south, .west, .north, .east, .floor, .ceiling )

                _ ->
                    ( .west, .north, .east, .south, .floor, .ceiling )
    in
    { left = left room
    , front = front room
    , right = right room
    , back = back room
    , floor = floor room
    , ceiling = ceiling room
    }


features : RelativeRoom -> List Thing
features room =
    let
        leftFeatures f =
            case f of
                Maze.Open ->
                    [ Thing.LeftOpen ]

                Maze.Door ->
                    [ Thing.LeftDoor ]

                Maze.MagicDoor ->
                    [ Thing.LeftMagicDoor, Thing.LeftWall ]

                _ ->
                    [ Thing.LeftWall ]

        rightFeatures f =
            case f of
                Maze.Open ->
                    [ Thing.RightOpen ]

                Maze.Door ->
                    [ Thing.RightDoor ]

                Maze.MagicDoor ->
                    [ Thing.RightMagicDoor, Thing.RightWall ]

                _ ->
                    [ Thing.RightWall ]

        frontFeatures f =
            case f of
                Maze.Open ->
                    [ Thing.FrontOpen ]

                Maze.Door ->
                    [ Thing.FrontDoor ]

                Maze.MagicDoor ->
                    [ Thing.FrontMagicDoor, Thing.FrontWall ]

                _ ->
                    [ Thing.FrontWall ]

        floorFeatures f =
            case f of
                Maze.Open ->
                    [ Thing.HoleFloor ]

                Maze.Ladder ->
                    [ Thing.LadderFloor ]

                _ ->
                    [ Thing.Floor ]

        ceilingFeatures f =
            case f of
                Maze.Open ->
                    [ Thing.HoleCeiling ]

                Maze.Ladder ->
                    [ Thing.LadderCeiling ]

                _ ->
                    [ Thing.Ceiling ]
    in
    List.concat
        [ leftFeatures room.left
        , rightFeatures room.right
        , frontFeatures room.front
        , floorFeatures room.floor
        , ceilingFeatures room.ceiling
        ]


isMagic x =
    List.member x
        [ Thing.LeftMagicDoor
        , Thing.RightMagicDoor
        , Thing.FrontMagicDoor
        , Thing.Scorpion
        , Thing.MoonWizard
        , Thing.Demon
        , Thing.Galdrog
        , Thing.Wraith
        ]


tunnel : Int -> Int -> Float -> Int -> Model -> List (Svg msg)
tunnel x y t dir model =
    let
        thisRoom =
            List.concat
                [ features relativeRoom
                , List.map (.object >> .class) (matchPosition ( model.level, x, y ) model.treasure)
                , List.map (.statistics >> .creature) (matchPosition ( model.level, x, y ) model.monsters)
                , peekingCreature -1 Thing.CreatureLeft relativeRoom.left
                , peekingCreature 1 Thing.CreatureRight relativeRoom.right
                ]

        ( thisRoomMagic, thisRoomNormal ) =
            List.partition isMagic thisRoom

        normalLight model obj =
            if displayWizardDied model then
                7
            else
                obj.normalLight

        magicLight model obj =
            if displayWizardDied model then
                19
            else
                obj.magicLight

        darkness model dist getLight =
            -- Usually, brightness is proportional to the luminosity of the
            -- source times the inverse square of the distance. In this model,
            -- brightness is constant for some distance depending on the
            -- luminosity of the source, then it decays exponentially for 6
            -- units, until it is finally zero.
            let
                activeTorch =
                    Maybe.withDefault (item Thing.Empty 0) (List.head (List.filter isLitTorch model.inventory))

                exponent =
                    (6 + round dist) - getLight model activeTorch

                pixelGap =
                    if exponent < 0 then
                        0
                    else if 5 < exponent then
                        -1
                    else
                        2 ^ exponent
            in
            pixelGap

        svgNormal =
            if -1 < darkness model t normalLight then
                [ Svg.g [ transform (distance t), strokeDasharray ("1, " ++ toString (darkness model t normalLight)), strokeDashoffset "5" ] (List.concat (List.map (\e -> image (foregroundColor model) e) thisRoomNormal)) ]
            else
                []

        svgMagic =
            if -1 < darkness model t magicLight then
                [ Svg.g [ transform (distance t), strokeDasharray ("1, " ++ toString (darkness model t magicLight)), strokeDashoffset "5" ] (List.concat (List.map (\e -> image (foregroundColor model) e) thisRoomMagic)) ]
            else
                []

        svg =
            List.concat [ svgNormal, svgMagic ]

        ( nx, ny ) =
            step model.level x y dir

        relativeRoom =
            absRoom2relRoom (Maze.getRoom model.level x y) model.orientation

        peekingCreature turn thing side =
            let
                ( nx, ny ) =
                    step model.level x y (cwTurn dir turn)
            in
            if side == Maze.Open && thereIsAThing ( model.level, nx, ny ) model.monsters then
                [ thing ]
            else
                []
    in
    if relativeRoom.front /= Maze.Open || ( nx, ny ) == ( x, y ) then
        svg
    else
        List.concat [ tunnel nx ny (t + 1) dir model, svg ]


name object =
    if object.revealed && object.adj /= "" then
        object.adj ++ " " ++ object.noun
    else
        object.noun


foregroundColor model =
    if model.level % 2 == 0 then
        "white"
    else
        "black"


backgroundColor model =
    foregroundColor { model | level = model.level + 1 }


statusBar model =
    Html.div
        [ Html.Attributes.style
            [ ( "color", backgroundColor model )
            , ( "background", foregroundColor model )
            , ( "font-family", "fantasy" )
            ]
        ]
        [ Html.table
            [ Html.Attributes.style
                [ ( "width", "100%" )
                , ( "table-layout", "fixed" )
                , ( "padding", "0px" )
                , ( "border", "none" )
                , ( "border-spacing", "0px" )
                ]
            ]
            [ Html.tr
                []
                [ Html.td
                    [ Html.Attributes.style
                        [ ( "text-align", "left" )
                        ]
                    ]
                    [ Html.text (name (getLeftHand model))
                    ]
                , Html.td
                    [ Html.Attributes.style
                        [ ( "text-align", "center" )
                        , ( "height", "30px" )
                        , ( "font-size", model.heart )
                        ]
                    ]
                    [ Html.text (String.fromChar (Char.fromCode 9829))
                    ]
                , Html.td
                    [ Html.Attributes.style
                        [ ( "text-align", "right" )
                        ]
                    ]
                    [ Html.text (name (getRightHand model))
                    ]
                ]
            ]
        ]


inputWindow model =
    let
        get n =
            Maybe.withDefault "" (Array.get n (Array.fromList model.history))
    in
    Html.div
        [ Html.Attributes.style
            [ ( "color", foregroundColor model )
            , ( "background", backgroundColor model )
            , ( "font-family", "fantasy" )
            ]
        ]
        [ Html.div [] [ Html.text (String.concat [ ". ", get 0 ]) ]
        , Html.div [] [ Html.text (String.concat [ ". ", get 1 ]) ]
        , Html.div [] [ Html.text (String.concat [ ". ", get 2 ]) ]
        , Html.form
            [ Html.Attributes.style
                []
            , Html.Events.onWithOptions "submit" { preventDefault = True, stopPropagation = False } (Json.Decode.succeed Submit)
            ]
            [ Html.div [ Html.Attributes.style [ ( "float", "left" ) ] ] [ Html.text ". " ]
            , Html.div [ Html.Attributes.style [ ( "overflow", "hidden" ) ] ]
                [ Html.input
                    [ Html.Attributes.style
                        [ ( "color", foregroundColor model )
                        , ( "background", backgroundColor model )
                        , ( "font-family", "fantasy" )
                        , ( "padding", "0px" )
                        , ( "width", "100%" )
                        , ( "outline", "none" )
                        , ( "border", "none" )
                        , ( "font-size", "16px" )
                        ]
                    , autofocus True
                    , autocomplete False
                    , Html.Events.onInput Command
                    , Html.Attributes.value model.input
                    , Html.Attributes.id "cli"
                    ]
                    []
                ]
            ]
        ]


viewDungeon : Model -> Html msg
viewDungeon model =
    svg
        [ Svg.Attributes.width "768"
        , Svg.Attributes.height "456"
        , Svg.Attributes.viewBox "0 0 256 152"
        ]
        (tunnel model.x model.y 0 model.orientation model)


viewScroll adj model =
    let
        block x y colour =
            Svg.path [ transform ("translate(" ++ toString x ++ " " ++ toString y ++ ")"), stroke colour, fill colour, d "M 0 0 L 3 0 L 3 3 L 0 3 Z" ] []

        thing x y colour =
            Svg.path [ transform ("translate(" ++ toString x ++ " " ++ toString y ++ ")"), stroke colour, fill colour, d "M 0 0 L 3 3 M 0 3 L 3 0" ] []

        hole x y colour =
            Svg.path [ transform ("translate(" ++ toString x ++ " " ++ toString y ++ ")"), stroke colour, fill colour, d "M 1 1 L 2 1 L 2 2 L 1 2 Z" ] []

        map =
            List.concat
                (List.map
                    (\x ->
                        List.map
                            (\y ->
                                let
                                    room =
                                        Maze.getRoom model.level x y
                                in
                                if room == solid then
                                    block (x * 4) (y * 4) (backgroundColor model)
                                else if (room.floor /= Maze.Solid) || (room.ceiling /= Maze.Solid) then
                                    Svg.g []
                                        [ block (x * 4) (y * 4) (foregroundColor model)
                                        , hole (x * 4) (y * 4) "blue"
                                        ]
                                else
                                    block (x * 4) (y * 4) (foregroundColor model)
                            )
                            (List.range 0 31)
                    )
                    (List.range 0 31)
                )

        player =
            [ thing (model.x * 4) (model.y * 4) (backgroundColor model) ]

        creatures =
            List.map (\e -> thing (e.x * 4) (e.y * 4) "red") (List.filter (\e -> e.level == model.level) model.monsters)

        treasure =
            List.map (\e -> thing (e.x * 4) (e.y * 4) "green") (List.filter (\e -> e.level == model.level) model.treasure)
    in
    svg
        [ Svg.Attributes.width "768"
        , Svg.Attributes.height "456"
        , Svg.Attributes.viewBox "0 0 256 152"
        ]
        [ Svg.g [ transform ("translate(" ++ toString ((256 - 32 * 4) / 2) ++ "," ++ toString ((152 - 32 * 4) / 2) ++ ")") ]
            (if adj == "seer" then
                List.concat [ map, player, treasure, creatures ]
             else
                List.concat [ map, player ]
            )
        ]


viewText : Model -> Html msg
viewText model =
    let
        rows lst =
            case lst of
                [] ->
                    []

                [ a ] ->
                    [ Html.tr
                        [ Html.Attributes.style
                            [ ( "width", "100%" ) ]
                        ]
                        [ Html.td
                            [ Html.Attributes.style [ ( "padding", "0px 20px" ), ( "text-align", "right" ) ] ]
                            [ Html.text a ]
                        , Html.td [] []
                        ]
                    ]

                a :: b :: rest ->
                    Html.tr [ Html.Attributes.style [ ( "width", "100%" ) ] ]
                        [ Html.td [ Html.Attributes.style [ ( "padding", "0px 20px" ), ( "text-align", "right" ) ] ]
                            [ Html.text a ]
                        , Html.td [ Html.Attributes.style [ ( "padding", "0px 20px" ), ( "text-align", "left" ) ] ] [ Html.text b ]
                        ]
                        :: rows rest

        rowsHtml lst =
            case lst of
                [] ->
                    []

                [ a ] ->
                    [ Html.tr
                        [ Html.Attributes.style
                            [ ( "width", "100%" ) ]
                        ]
                        [ Html.td
                            [ Html.Attributes.style [ ( "padding", "0px 20px" ), ( "text-align", "right" ) ] ]
                            [ a ]
                        , Html.td [] []
                        ]
                    ]

                a :: b :: rest ->
                    Html.tr [ Html.Attributes.style [ ( "width", "100%" ) ] ]
                        [ Html.td [ Html.Attributes.style [ ( "padding", "0px 20px" ), ( "text-align", "right" ) ] ]
                            [ a ]
                        , Html.td [ Html.Attributes.style [ ( "padding", "0px 20px" ), ( "text-align", "left" ) ] ] [ b ]
                        ]
                        :: rowsHtml rest

        objects =
            List.map (\e -> name e.object) (List.filter (equalPosition model) model.treasure)
    in
    Html.div
        [ Html.Attributes.style
            [ ( "color", foregroundColor model )
            , ( "background", backgroundColor model )
            , ( "font-family", "fantasy" )
            , ( "width", "768px" )
            , ( "height", "456px" )
            ]
        ]
        [ Html.table
            [ Html.Attributes.style
                [ ( "width", "100%" )
                , ( "table-layout", "fixed" )
                , ( "border", "none" )
                , ( "border-spacing", "0px" )
                ]
            ]
            (List.concat
                [ Html.tr
                    [ Html.Attributes.style
                        [ ( "width", "100%" ), ( "text-align", "center" ) ]
                    ]
                    [ Html.td
                        [ Html.Attributes.attribute
                            "colspan"
                            "2"
                        ]
                        [ Html.span [ Html.Attributes.style [ ( "font-style", "italic" ) ] ] [ Html.text "- In This Room -" ] ]
                    ]
                    :: rows
                        (if List.any (equalPosition model) model.monsters then
                            "! Creature !" :: objects
                         else
                            objects
                        )
                , [ Html.tr
                        [ Html.Attributes.style
                            [ ( "width", "100%" ), ( "text-align", "center" ) ]
                        ]
                        [ Html.td
                            [ Html.Attributes.attribute
                                "colspan"
                                "2"
                            ]
                            [ Html.text (String.repeat 41 " ") ]
                        ]
                  ]
                , Html.tr
                    [ Html.Attributes.style
                        [ ( "width", "100%" ), ( "text-align", "center" ) ]
                    ]
                    [ Html.td
                        [ Html.Attributes.attribute
                            "colspan"
                            "2"
                        ]
                        [ Html.span [ Html.Attributes.style [ ( "font-style", "italic" ) ] ] [ Html.text "- Backpack -" ] ]
                    ]
                    :: rowsHtml (List.map (\e -> backpack model e) model.inventory)
                ]
            )
        ]


backpack model object =
    if isLitTorch object then
        Html.span
            [ Html.Attributes.style
                [ ( "color", backgroundColor model ), ( "background-color", foregroundColor model ) ]
            ]
            [ Html.text (name object) ]
    else
        Html.span [] [ Html.text (name object) ]


wizardBuzzIn creature frame =
    div
        [ Html.Attributes.style
            [ ( "width", "768px" )
            , ( "margin-left", "auto" )
            , ( "margin-right", "auto" )
            , ( "display", "block" )
            , ( "font-size", "16px" )
            ]
        ]
        [ div [ Html.Attributes.style [ ( "font-size", "16px" ), ( "font-family", "fantasy" ) ] ]
            [ svg
                [ Svg.Attributes.width "768"
                , Svg.Attributes.height "456"
                , Svg.Attributes.viewBox "0 0 256 152"
                ]
                [ Svg.g [ strokeDasharray ("1," ++ toString (32 - (2 * frame))) ]
                    (image "black" creature)
                ]
            ]
        ]


prepare model =
    div
        [ Html.Attributes.style
            [ ( "width", "768px" )
            , ( "margin-left", "auto" )
            , ( "margin-right", "auto" )
            , ( "display", "block" )
            , ( "font-size", "16px" )
            ]
        ]
        [ div
            [ Html.Attributes.style
                [ ( "align-items", "center" )
                , ( "height", "456px" )
                , ( "display", "flex" )
                , ( "justify-content", "center" )
                , ( "font-family", "fantasy" )
                , ( "color", foregroundColor model )
                ]
            ]
            [ Html.text "Prepare!" ]
        ]


wizardMessage creature line1 line2 line3 =
    div
        [ Html.Attributes.style
            [ ( "width", "768px" )
            , ( "margin-left", "auto" )
            , ( "margin-right", "auto" )
            , ( "display", "block" )
            , ( "font-size", "16px" )
            ]
        ]
        [ div [ Html.Attributes.style [ ( "font-size", "16px" ), ( "font-family", "fantasy" ) ] ]
            [ svg
                [ Svg.Attributes.width "768"
                , Svg.Attributes.height "456"
                , Svg.Attributes.viewBox "0 0 256 152"
                ]
                (image "black" creature)
            , div [ Html.Attributes.style [ ( "width", "768px" ), ( "text-align", "center" ) ] ] [ Html.text line1 ]
            , div [ Html.Attributes.style [ ( "width", "768px" ), ( "text-align", "center" ) ] ] [ Html.text line2 ]
            , div [ Html.Attributes.style [ ( "width", "768px" ), ( "text-align", "center" ) ] ] [ Html.text line3 ]
            ]
        ]


wizardBuzzOut creature frame =
    div
        [ Html.Attributes.style
            [ ( "width", "768px" )
            , ( "margin-left", "auto" )
            , ( "margin-right", "auto" )
            , ( "display", "block" )
            , ( "font-size", "16px" )
            ]
        ]
        [ div [ Html.Attributes.style [ ( "font-size", "16px" ), ( "font-family", "fantasy" ) ] ]
            [ svg
                [ Svg.Attributes.width "768"
                , Svg.Attributes.height "456"
                , Svg.Attributes.viewBox "0 0 256 152"
                ]
                [ Svg.g [ strokeDasharray ("1," ++ toString (2 * frame)) ]
                    (image "black" creature)
                ]
            ]
        ]


viewIntro model =
    if model.frame < 17 then
        wizardBuzzIn MoonWizard model.frame
    else if model.frame < 25 then
        wizardMessage MoonWizard "I dare ye enter..." "...the Dungeons of Daggorath!!!" ""
    else if model.frame < 33 then
        wizardMessage MoonWizard "I dare ye enter..." "...the Dungeons of Daggorath!!!" "(tribute)"
    else
        -- model.frame < 48
        wizardBuzzOut MoonWizard (model.frame - 33)


viewDead model =
    if model.frame < 17 then
        wizardBuzzIn MoonWizard model.frame
    else if model.frame < 33 then
        wizardMessage MoonWizard "Yet another does not return..." "" ""
    else
        div [] []


viewIntermission model =
    if model.frame < 17 then
        wizardBuzzIn MoonWizard model.frame
    else if model.frame < 33 then
        wizardMessage MoonWizard "Enough! I tire of this play..." "prepare to meet thy doom!!!" ""
    else
        -- model.frame < 48
        wizardBuzzOut MoonWizard (model.frame - 33)


viewEnding model =
    if model.frame < 17 then
        wizardBuzzIn StarWizard model.frame
    else
        wizardMessage StarWizard "Behold! Destiny awaits the hand" "of a new wizard..." ""


view : Model -> Html Msg
view model =
    if displayEnding model then
        viewEnding model
    else if displayIntermission model then
        viewIntermission model
    else if displayPlayerDied model then
        viewDead model
    else if model.display /= "intro" && not (isFainted model) && model.status /= "dead" then
        div
            [ Html.Attributes.style
                [ ( "width", "768px" )
                , ( "margin-left", "auto" )
                , ( "margin-right", "auto" )
                , ( "display", "block" )
                , ( "font-size", "16px" )
                , ( "background", backgroundColor model )
                ]
            ]
            [ (case model.display of
                "dungeon" ->
                    viewDungeon

                "wizarddead" ->
                    viewDungeon

                "seer" ->
                    viewScroll "seer"

                "vision" ->
                    viewScroll "vision"

                "prepare" ->
                    prepare

                _ ->
                    viewText
              )
                model
            , statusBar model
            , if not (isFainted model) then
                inputWindow model
              else
                -- died!!!!
                div [] []
            , div [ Html.Attributes.style [ ( "display", "none" ) ] ] [ Html.text (toString model) ]
            ]
    else
        viewIntro model



-- DATA


creature : Thing -> Creature
creature img =
    case img of
        Thing.Spider ->
            { power = 32, damage = 0, moveRate = 23, attackRate = 11, attack = 128, defence = 255, magic = 0, resistance = 255, creature = Spider }

        Thing.Viper ->
            { power = 56, damage = 0, moveRate = 15, attackRate = 7, attack = 80, defence = 128, magic = 0, resistance = 255, creature = Viper }

        Thing.ClubGiant ->
            { power = 200, damage = 0, moveRate = 29, attackRate = 23, attack = 52, defence = 192, magic = 0, resistance = 255, creature = ClubGiant }

        Thing.Blob ->
            { power = 304, damage = 0, moveRate = 31, attackRate = 31, attack = 96, defence = 192, magic = 0, resistance = 255, creature = Blob }

        Thing.HatchetGiant ->
            { power = 704, damage = 0, moveRate = 17, attackRate = 13, attack = 128, defence = 48, magic = 0, resistance = 128, creature = HatchetGiant }

        Thing.Knight ->
            { power = 504, damage = 0, moveRate = 13, attackRate = 7, attack = 96, defence = 60, magic = 0, resistance = 128, creature = Knight }

        Thing.ShieldKnight ->
            { power = 800, damage = 0, moveRate = 13, attackRate = 7, attack = 255, defence = 8, magic = 0, resistance = 64, creature = ShieldKnight }

        Thing.Scorpion ->
            { power = 400, damage = 0, moveRate = 5, attackRate = 4, attack = 255, defence = 128, magic = 255, resistance = 128, creature = Scorpion }

        Thing.Demon ->
            { power = 1000, damage = 0, moveRate = 13, attackRate = 7, attack = 255, defence = 0, magic = 255, resistance = 6, creature = Demon }

        Thing.Wraith ->
            { power = 800, damage = 0, moveRate = 3, attackRate = 3, attack = 192, defence = 8, magic = 192, resistance = 16, creature = Wraith }

        Thing.Galdrog ->
            { power = 1000, damage = 0, moveRate = 4, attackRate = 3, attack = 255, defence = 3, magic = 255, resistance = 5, creature = Galdrog }

        Thing.MoonWizard ->
            { power = 8000, damage = 0, moveRate = 13, attackRate = 7, attack = 255, defence = 0, magic = 255, resistance = 6, creature = MoonWizard }

        _ ->
            creature Thing.Spider


item : Thing -> Int -> Treasure
item img num =
    case img of
        Thing.Empty ->
            { charges = 0, magicLight = 0, normalLight = 0, adj = "", noun = "Empty", flag = False, magic = 0, resistance = 128, weight = 0, attack = 5, defence = 128, power = 0, revealed = True, class = Empty, id = 0 }

        Thing.LeatherShield ->
            { charges = 0, magicLight = 0, normalLight = 0, adj = "Leather", noun = "Shield", flag = False, magic = 0, resistance = 128, weight = 25, attack = 10, defence = 108, power = 125, revealed = False, class = Shield, id = num }

        Thing.BronzeShield ->
            { charges = 0, magicLight = 0, normalLight = 0, adj = "Bronze", noun = "Shield", flag = False, magic = 0, resistance = 128, weight = 25, attack = 26, defence = 64, power = 625, revealed = False, class = Shield, id = num }

        Thing.MithrilShield ->
            { charges = 0, magicLight = 0, normalLight = 0, adj = "Mithril", noun = "Shield", flag = False, magic = 13, resistance = 64, weight = 25, attack = 26, defence = 128, power = 3500, revealed = False, class = Shield, id = num }

        Thing.GiantShield ->
            { charges = 0, magicLight = 0, normalLight = 0, adj = "Isaac", noun = "Shield", flag = False, magic = 255, resistance = 0, weight = 0, attack = 255, defence = 0, power = 0, revealed = True, class = Shield, id = num }

        Thing.WoodenSword ->
            { charges = 0, magicLight = 0, normalLight = 0, adj = "Wooden", noun = "Sword", flag = False, magic = 0, resistance = 128, weight = 25, attack = 16, defence = 128, power = 125, revealed = False, class = Sword, id = num }

        Thing.IronSword ->
            { charges = 0, magicLight = 0, normalLight = 0, adj = "Iron", noun = "Sword", flag = False, magic = 0, resistance = 128, weight = 25, attack = 40, defence = 128, power = 325, revealed = False, class = Sword, id = num }

        Thing.ElvishSword ->
            { charges = 0, magicLight = 0, normalLight = 0, adj = "Elvish", noun = "Sword", flag = False, magic = 64, resistance = 128, weight = 25, attack = 64, defence = 128, power = 3750, revealed = False, class = Sword, id = num }

        Thing.DeadTorch ->
            { charges = 0, magicLight = 0, normalLight = 0, adj = "Dead", noun = "Torch", flag = False, magic = 0, resistance = 128, weight = 10, attack = 5, defence = 128, power = 0, revealed = True, class = Thing.Torch, id = num }

        Thing.PineTorch ->
            { charges = 15, magicLight = 0, normalLight = 7, adj = "Pine", noun = "Torch", flag = False, magic = 0, resistance = 128, weight = 10, attack = 5, defence = 128, power = 125, revealed = False, class = Thing.Torch, id = num }

        Thing.LunarTorch ->
            { charges = 30, magicLight = 4, normalLight = 10, adj = "Lunar", noun = "Torch", flag = False, magic = 0, resistance = 128, weight = 10, attack = 5, defence = 128, power = 625, revealed = False, class = Thing.Torch, id = num }

        Thing.SolarTorch ->
            { charges = 60, magicLight = 11, normalLight = 13, adj = "Solar", noun = "Torch", flag = False, magic = 0, resistance = 128, weight = 10, attack = 5, defence = 128, power = 1750, revealed = False, class = Thing.Torch, id = num }

        Thing.ThewsFlask ->
            { charges = 1, magicLight = 0, normalLight = 0, adj = "Thews", noun = "Flask", flag = False, magic = 0, resistance = 128, weight = 5, attack = 5, defence = 128, power = 1750, revealed = False, class = Flask, id = num }

        Thing.AbyeFlask ->
            { charges = 1, magicLight = 0, normalLight = 0, adj = "Abye", noun = "Flask", flag = False, magic = 0, resistance = 128, weight = 5, attack = 5, defence = 128, power = 1200, revealed = False, class = Flask, id = num }

        Thing.HaleFlask ->
            { charges = 1, magicLight = 0, normalLight = 0, adj = "Hale", noun = "Flask", flag = False, magic = 0, resistance = 128, weight = 5, attack = 5, defence = 128, power = 1000, revealed = False, class = Flask, id = num }

        Thing.EmptyFlask ->
            { charges = 0, magicLight = 0, normalLight = 0, adj = "Empty", noun = "Flask", flag = False, magic = 0, resistance = 128, weight = 5, attack = 5, defence = 128, power = 0, revealed = True, class = Flask, id = num }

        Thing.SupremeRing ->
            { charges = 0, magicLight = 0, normalLight = 0, adj = "Supreme", noun = "Ring", flag = False, magic = 0, resistance = 128, weight = 5, attack = 5, defence = 128, power = 6375, revealed = False, class = Ring, id = num }

        Thing.JouleRing ->
            { charges = 0, magicLight = 0, normalLight = 0, adj = "Joule", noun = "Ring", flag = False, magic = 0, resistance = 128, weight = 5, attack = 5, defence = 128, power = 4250, revealed = False, class = Ring, id = num }

        Thing.RimeRing ->
            { charges = 0, magicLight = 0, normalLight = 0, adj = "Rime", noun = "Ring", flag = False, magic = 0, resistance = 128, weight = 5, attack = 5, defence = 128, power = 1300, revealed = False, class = Ring, id = num }

        Thing.VulcanRing ->
            { charges = 0, magicLight = 0, normalLight = 0, adj = "Vulcan", noun = "Ring", flag = False, magic = 0, resistance = 128, weight = 5, attack = 5, defence = 128, power = 325, revealed = False, class = Ring, id = num }

        Thing.FireRing ->
            { charges = 3, magicLight = 0, normalLight = 0, adj = "Fire", noun = "Ring", flag = False, magic = 255, resistance = 128, weight = 5, attack = 255, defence = 128, power = 325, revealed = True, class = Ring, id = num }

        Thing.IceRing ->
            { charges = 3, magicLight = 0, normalLight = 0, adj = "Ice", noun = "Ring", flag = False, magic = 255, resistance = 128, weight = 5, attack = 255, defence = 128, power = 1300, revealed = True, class = Ring, id = num }

        Thing.FinalRing ->
            { charges = 3, magicLight = 0, normalLight = 0, adj = "Final", noun = "Ring", flag = False, magic = 255, resistance = 128, weight = 5, attack = 255, defence = 128, power = 6375, revealed = True, class = Ring, id = num }

        Thing.EnergyRing ->
            { charges = 3, magicLight = 0, normalLight = 0, adj = "Energy", noun = "Ring", flag = False, magic = 255, resistance = 128, weight = 5, attack = 255, defence = 128, power = 4250, revealed = True, class = Ring, id = num }

        Thing.GoldRing ->
            { charges = 0, magicLight = 0, normalLight = 0, adj = "Gold", noun = "Ring", flag = False, magic = 0, resistance = 128, weight = 5, attack = 5, defence = 128, power = 0, revealed = True, class = Ring, id = num }

        Thing.SeerScroll ->
            { charges = 0, magicLight = 0, normalLight = 0, adj = "Seer", noun = "Scroll", flag = False, magic = 0, resistance = 128, weight = 10, attack = 5, defence = 128, power = 3250, revealed = False, class = Scroll, id = num }

        Thing.VisionScroll ->
            { charges = 0, magicLight = 0, normalLight = 0, adj = "Vision", noun = "Scroll", flag = False, magic = 0, resistance = 128, weight = 10, attack = 5, defence = 128, power = 1250, revealed = False, class = Scroll, id = num }

        _ ->
            item Thing.Empty 0


sounds =
    Dict.fromList
        [ --treasure
          ( serializeThing Thing.Shield, "shield" )
        , ( serializeThing Thing.Torch, "torch" )
        , ( serializeThing Thing.Sword, "sword" )
        , ( serializeThing Thing.Flask, "flask" )
        , ( serializeThing Thing.Ring, "ring" )
        , ( serializeThing Thing.Scroll, "scroll" )

        -- creatures
        , ( serializeThing Thing.Spider, "spider" )
        , ( serializeThing Thing.Viper, "viper" )
        , ( serializeThing Thing.ClubGiant, "club-giant" )
        , ( serializeThing Thing.Blob, "blob" )
        , ( serializeThing Thing.HatchetGiant, "axe-giant" )
        , ( serializeThing Thing.Knight, "knight" )
        , ( serializeThing Thing.ShieldKnight, "shield-knight" )
        , ( serializeThing Thing.Scorpion, "scorpion" )
        , ( serializeThing Thing.Demon, "wizard" )
        , ( serializeThing Thing.Wraith, "wraith" )
        , ( serializeThing Thing.Galdrog, "galdrog" )
        , ( serializeThing Thing.MoonWizard, "wizard" )

        -- events
        , ( serializeThing Thing.Heart, "heart" )
        , ( serializeThing Thing.CreatureDied, "creature-died" )
        , ( serializeThing Thing.CreatureHitPlayer, "creature-hit-player" )
        , ( serializeThing Thing.PlayerHitCreature, "player-hit-creature" )
        , ( serializeThing Thing.PlayerHitWall, "wall" )
        , ( serializeThing Thing.WizardFadeBuzz, "wizard-fade-buzz" )
        , ( serializeThing Thing.WizardFadeCrash, "wizard-fade-crash" )
        ]


sound : Thing -> String
sound img =
    let
        extension =
            ".mp3"

        path =
            "snd/"

        base =
            Dict.get (serializeThing img) sounds
    in
    case base of
        Maybe.Nothing ->
            ""

        Maybe.Just s ->
            path ++ s ++ extension


vocab_verb : List String
vocab_verb =
    [ "Attack"
    , "Climb"
    , "Drop"
    , "Examine"
    , "Get"
    , "Incant"
    , "Look"
    , "Move"
    , "Pull"
    , "Reveal"
    , "Stow"
    , "Turn"
    , "Use"
    , "Zsave"
    , "Zload"
    ]


vocab_adverb : List String
vocab_adverb =
    [ "Around"
    , "Back"
    , "Down"
    , "Left"
    , "Right"
    , "Up"
    , "Fire"
    , "Ice"
    , "Energy"
    , "Final"
    ]


vocab_adjective : List String
vocab_adjective =
    [ "Abye"
    , "Bronze"
    , "Dead"
    , "Elvish"
    , "Empty"
    , "Energy"
    , "Final"
    , "Fire"
    , "Gold"
    , "Hale"
    , "Ice"
    , "Iron"
    , "Joule"
    , "Leather"
    , "Lunar"
    , "Mithril"
    , "Pine"
    , "Rime"
    , "Seer"
    , "Solar"
    , "Supreme"
    , "Thews"
    , "Vision"
    , "Vulcan"
    , "Wooden"
    ]


vocab_noun : List String
vocab_noun =
    [ "Flask"
    , "Ring"
    , "Scroll"
    , "Shield"
    , "Sword"
    , "Torch"
    ]


image : String -> Thing -> List (Svg msg)
image color img =
    case img of
        Thing.Ceiling ->
            [ Svg.path [ stroke color, fill "transparent", d "M 47 28 L 209 28" ] []
            ]

        Thing.Border ->
            [ Svg.path [ stroke color, fill "transparent", d "M 0 0 L 255 0 L 255 151 L 0 151 Z" ] []
            ]

        Thing.LeftWall ->
            [ Svg.path [ stroke color, fill "transparent", d "M 27 16 L 64 38 L 64 114 L 27 136" ] []
            ]

        Thing.RightWall ->
            [ Svg.path [ stroke color, fill "transparent", d "M 229 16 L 192 38 L 192 114 L 229 136" ] []
            ]

        Thing.Shield ->
            [ Svg.path [ stroke color, fill "transparent", d "M 172 134 L 192 128 L 186 122 L 168 128 l -4 6 l 8 0" ] []
            ]

        Thing.Torch ->
            [ Svg.path [ stroke color, fill "transparent", d "M 60 118 l 14 -2 l -2 -2 l -12 4" ] []
            ]

        Thing.Sword ->
            [ Svg.path [ stroke color, fill "transparent", d "M 80 114 L 100 124" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 82 118 L 86 114" ] []
            ]

        Thing.Flask ->
            [ Svg.path [ stroke color, fill "transparent", d "M 162 110 l 2 10 l -4 0 l 2 -10" ] []
            ]

        Thing.Ring ->
            [ Svg.path [ stroke color, fill "transparent", d "M 60 122 l 2 2 l -2 2 l -2 -2 l 2 -2" ] []
            ]

        Thing.Scroll ->
            [ Svg.path [ stroke color, fill "transparent", d "M 194 118 l -2 2 l 8 6 l 2 -2 l -8 -6" ] []
            ]

        Thing.FrontWall ->
            [ Svg.path [ stroke color, fill "transparent", d "M 64 38 L 192 38" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 64 114 L 192 114" ] []
            ]

        Thing.LeftOpen ->
            [ Svg.path [ stroke color, fill "transparent", d "M 27 38 L 64 38 L 64 114 L 27 114" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 27 16 L 64 38" ] []
            ]

        Thing.RightOpen ->
            [ Svg.path [ stroke color, fill "transparent", d "M 229 38 L 192 38 L 192 114 L 229 114" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 229 16 L 192 38" ] []
            ]

        Thing.FrontOpen ->
            []

        Thing.Floor ->
            []

        Thing.LeftDoor ->
            [ Svg.path [ stroke color, fill "transparent", d "M 40 128 L 40 65 L 56 68 L 56 119" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 48 92 L 52 93" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 27 16 L 64 38 L 64 114 L 27 136" ] []
            ]

        Thing.RightDoor ->
            [ Svg.path [ stroke color, fill "transparent", d "M 216 128 L 216 65 L 200 68 L 200 119" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 208 92 L 204 93" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 229 16 L 192 38 L 192 114 L 229 136" ] []
            ]

        Thing.FrontDoor ->
            [ Svg.path [ stroke color, fill "transparent", d "M 108 114 L 108 67 L 148 67 L 148 114" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 126 94 L 130 94" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 64 38 L 192 38" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 64 114 L 192 114" ] []
            ]

        Thing.LeftMagicDoor ->
            [ Svg.path [ stroke color, fill "transparent", d "M 40 128 L 50 66 L 58 117" ] []
            ]

        Thing.RightMagicDoor ->
            [ Svg.path [ stroke color, fill "transparent", d "M 216 128 L 206 66 L 198 117" ] []
            ]

        Thing.FrontMagicDoor ->
            [ Svg.path [ stroke color, fill "transparent", d "M 108 114 L 128 67 L 148 114" ] []
            ]

        Thing.CreatureLeft ->
            [ Svg.path [ stroke color, fill "transparent", d "M 28 100 l 8 8 l -4 4 l 4 8 l -8 8" ] []
            ]

        Thing.CreatureRight ->
            [ Svg.path [ stroke color, fill "transparent", d "M 228 100 l -8 8 l 4 4 l -4 8 l 8 8" ] []
            ]

        Thing.LadderCeiling ->
            [ Svg.path [ stroke color, fill "transparent", d "M 116 24 L 116 128" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 140 24 L 140 128" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 116 28 L 140 28" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 116 40 L 140 40" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 116 52 L 140 52" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 116 64 L 140 64" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 116 76 L 140 76" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 116 88 L 140 88" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 116 100 L 140 100" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 116 112 L 140 112" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 116 123 L 140 123" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 100 34 L 92 24 L 164 24 L 156 34 L 100 34 L 100 24" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 156 34 L 156 24" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 47 28 L 96 28" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 161 28 L 210 28" ] []
            ]

        Thing.LadderFloor ->
            [ Svg.path [ stroke color, fill "transparent", d "M 116 24 L 116 128" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 140 24 L 140 128" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 116 28 L 140 28" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 116 40 L 140 40" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 116 52 L 140 52" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 116 64 L 140 64" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 116 76 L 140 76" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 116 88 L 140 88" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 116 100 L 140 100" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 116 112 L 140 112" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 116 123 L 140 123" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 100 118 L 92 128 L 164 128 L 156 118 L 100 118 L 100 128" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 156 118 L 156 128" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 47 28 L 210 28" ] []
            ]

        Thing.HoleCeiling ->
            [ Svg.path [ stroke color, fill "transparent", d "M 100 34 L 92 24 L 164 24 L 156 34 L 100 34 L 100 24" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 156 34 L 156 24" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 47 28 L 96 28" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 161 28 L 210 28" ] []
            ]

        Thing.HoleFloor ->
            [ Svg.path [ stroke color, fill "transparent", d "M 100 118 L 92 128 L 164 128 L 156 118 L 100 118 L 100 128" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 156 118 L 156 128" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 47 28 L 210 28" ] []
            ]

        Thing.ClubGiant ->
            [ Svg.path [ stroke color, fill "transparent", d "M 98 104 l 14 -6 l 8 -6 l 8 2 l 4 2 l 0 6 l -6 2 l -6 0 l -6 -2 l -14 4" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 132 102 l 4 0 l 12 10 l 12 10 l 14 2 l -4 -4 l 4 0 l -12 -4 l -10 -10 l -10 -10 l -12 -4 l -12 -4" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 92 78 l 4 -8 l 2 10 l -4 6 l -2 -8 l -8 -2 l 4 8 l 6 2" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 90 106 l -4 2 l 2 2 l 6 -2 l 4 12 l -14 6 l 4 -4 l -8 0 l 8 -4 l -12 -16 l 4 -4" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 84 86 l 8 10 l 10 12 l -4 4 l -12 -8 l -12 -10 l 2 -12 l 8 -6 l -4 -4 l 4 2 l 4 -6 l 6 2 l 2 -4 l 0 4 l 12 -2 l 8 4 l 4 14 l -16 10 l -4 -4 l 10 -8 l -4 -10" ] []
            ]

        Thing.HatchetGiant ->
            [ Svg.path [ stroke color, fill "transparent", d "M 98 104 L 124 94 L 126 96 L 100 106" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 132 102 L 114 92 L 118 102 L 114 110 L 132 102" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 132 102 l 4 0 l 12 10 l 12 10 l 14 2 l -4 -4 l 4 0 l -12 -4 l -10 -10 l -10 -10 l -12 -4 l -12 -4" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 92 78 l 4 -8 l 2 10 l -4 6 l -2 -8 l -8 -2 l 4 8 l 6 2" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 90 106 l -4 2 l 2 2 l 6 -2 l 4 12 l -14 6 l 4 -4 l -8 0 l 8 -4 l -12 -16 l 4 -4" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 84 86 l 8 10 l 10 12 l -4 4 l -12 -8 l -12 -10 l 2 -12 l 8 -6 l -4 -4 l 4 2 l 4 -6 l 6 2 l 2 -4 l 0 4 l 12 -2 l 8 4 l 4 14 l -16 10 l -4 -4 l 10 -8 l -4 -10" ] []
            ]

        Thing.Galdrog ->
            [ Svg.path [ stroke color, fill "transparent", d "M 124 80 L 114 94 L 120 110 L 112 132 L 78 104 L 48 132 L 72 68 L 32 84 L 88 22 L 114 52 L 128 92 L 142 52 L 168 22 L 224 88 L 184 68 L 208 132 L 178 112 L 144 132 L 136 110 L 142 94 L 132 80" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 112 132 l 10 -8 l 4 -14 l -4 -10 l 6 -8 l 6 8 l -4 10 l 4 14 l 10 8" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 122 82 l -16 14 l -14 -4 l -6 -16 l -8 -4 l 6 6 l -8 0 l 8 4 l 4 14 l 14 8 l 14 -4" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 168 22 l -6 4 l 4 -8 l -6 6 l 0 6 l -10 8 l -10 8 l -6 -4 l 4 -10 l -6 -14 l 2 14 l -6 6 l -6 -6 l 2 -14 l -6 14 l 4 10 l 6 12 l 6 -12 l -6 4 l -6 -4 l -6 4 l -10 -8 l -10 -8 l 0 -6 l -6 -6 l 4 8 l -6 -4" ] []
            ]

        Thing.Wraith ->
            [ Svg.path [ stroke color, fill "transparent", d "M 68 62 L 88 68 L 100 56" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 90 74 L 74 70 l 6 6 l 10 -2 l 10 -2 l 2 -8 l -12 10 l 4 12 l -4 0" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 80 100 l 6 -10 l 14 2 l 8 6 l -10 -4 l -12 0 l -6 6" ] []
            ]

        Thing.Spider ->
            [ Svg.path [ stroke color, fill "transparent", d "M 160 124 l 4 -8 l 4 4 l 8 -4 l 8 4 l -8 4 l -8 -4 l 8 0 l 8 0 l 4 -4 l 4 8" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 168 124 l 2 -8 l 2 4 l 4 2 l 4 -2 l 2 -4 l 2 8" ] []
            ]

        Thing.Scorpion ->
            [ Svg.path [ stroke color, fill "transparent", d "M 74 112 l 0 -4 l -4 -4 l -8 4 l 4 8 l 8 2 l 8 2 l 0 4 l -8 0 l -8 -8 l 4 4 l -8 0 l 4 4" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 90 124 l 0 -4 l -8 0 l -8 4 l 0 4 l 8 0" ] []
            ]

        Thing.Blob ->
            [ Svg.path [ stroke color, fill "transparent", d "M 130 82 l -16 4 l -6 14 l -2 10 l 0 10 l -10 10 l 10 -2 l -2 4 l 10 -6 l 14 2 l 14 2 l 6 -2 l 4 4 l 2 -4 l 8 2 l -6 -6 l -2 -16 l -6 -16 l -10 -6 l -8 -4" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 130 86 l 6 6 l 2 6 l -10 2 l 2 -14 l -10 6 l -2 10 l 10 -2" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 116 108 L 118 114 L 144 120" ] []
            ]

        Thing.Knight ->
            [ Svg.path [ stroke color, fill "transparent", d "M 124 34 l 8 0 l -2 2 l -4 0 l -2 -2" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 142 80 L 136 64 L 146 46 L 156 64 L 140 82 L 136 76 L 146 64 L 140 58" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 140 80 L 152 128 L 160 132 L 144 132 L 144 126 L 130 84" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 126 84 L 110 126 L 110 132 L 92 132 L 102 128 L 116 80" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 140 80 l -12 6 l -14 -6 l 6 -16 l -4 -6 l -6 -12 l 12 -4 l 2 -12 l 4 -4 l 4 4 l 2 12 l 12 4 l -12 -4 l 0 4 l -6 6 l -6 -6 l 0 -4" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 128 52 L 128 20 l -4 0 l 2 4 l 4 0 l 2 -4 l -4 0" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 102 74 l 0 -4 l 4 0 l 0 -6 l -16 0 l 0 6 l 4 0 l 0 4 l 2 0 l 0 6 l 4 0 l 0 -6 l 2 0 l 14 -16" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 110 46 L 102 64 L 100 64 L 102 30 L 98 20 L 94 30 L 96 64 L 98 64 L 98 20" ] []
            ]

        Thing.ShieldKnight ->
            [ Svg.path [ stroke color, fill "transparent", d "M 126 30 l 0 10 l -2 0 l 0 -4" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 150 44 L 166 52 L 164 76 L 150 92 L 136 76 L 134 52 L 150 44" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 140 80 L 152 128 L 160 132 L 144 132 L 144 126 L 130 84" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 126 84 L 110 126 L 110 132 L 92 132 L 102 128 L 116 80" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 140 80 l -12 6 l -14 -6 l 6 -16 l -4 -6 l -6 -12 l 12 -4 l 2 -12 l 4 -4 l 4 4 l 2 12 l 12 4 l -12 -4 l 0 4 l -6 6 l -6 -6 l 0 -4" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 128 52 L 128 20 l -4 0 l 2 4 l 4 0 l 2 -4 l -4 0" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 102 74 l 0 -4 l 4 0 l 0 -6 l -16 0 l 0 6 l 4 0 l 0 4 l 2 0 l 0 6 l 4 0 l 0 -6 l 2 0 l 14 -16" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 110 46 L 102 64 L 100 64 L 102 30 L 98 20 L 94 30 L 96 64 L 98 64 L 98 20" ] []
            ]

        Thing.MoonWizard ->
            [ Svg.path [ stroke color, fill "transparent", d "M 98 46 l 2 4 l -2 4 l -6 4 l -6 -2 l -4 -8 l 4 -8 l 4 -2 l 4 2 l -2 0 l -4 2 l -2 6 l 2 4 l 4 2 l 6 -4 l 0 -4" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 154 104 l 2 4 l -2 4 l -6 4 l -6 -2 l -4 -8 l 4 -8 l 4 -2 l 4 2 l -2 0 l -4 2 l -2 6 l 4 4 l 4 2 l 4 -4 l 0 -4" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 124 64 l -4 8 l 0 -8 l -10 14 l -8 -14 l 8 -6 l 8 -4 l 2 -4 l 2 -4 l -6 -6 l -8 2 l 12 -14 l 6 0" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 130 28 l 6 0 l 10 8 l 2 14 l -12 -6 l -4 2 l 2 2 l 2 -4" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 134 48 L 142 54 L 164 116 L 132 132 L 118 130 L 94 120 L 110 90 L 132 132 L 106 72" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 102 64 l -2 2 l -6 -10 l 2 -2 l 6 10" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 102 66 l -4 2 l 4 6 l 2 2 l 6 14" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 112 88 L 120 72" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 132 62 L 128 20 L 122 52 L 122 64 L 124 60 L 128 114 L 130 80 L 130 68 L 132 62" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 130 40 l -2 -2 l -4 2 l 2 2 l 4 -2 l -2 6 l 0 4 l -2 0 l 0 -8 l -2 -2 l 2 6" ] []
            ]

        Thing.StarWizard ->
            [ Svg.path [ stroke color, fill "transparent", d "M 86 40 L 92 64 L 100 42 L 82 54 L 104 56 L 86 40" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 140 66 l 0 14 l -6 -12 l 10 6 l -10 2 l 6 -10" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 146 96 L 148 120 L 136 100 L 154 106 L 138 116 L 146 96" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 116 80 l 6 10 l -8 -4 l 8 -4 l -6 8 l 0 -10" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 124 64 l -4 8 l 0 -8 l -10 14 l -8 -14 l 8 -6 l 8 -4 l 2 -4 l 2 -4 l -6 -6 l -8 2 l 12 -14 l 6 0" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 130 28 l 6 0 l 10 8 l 2 14 l -12 -6 l -4 2 l 2 2 l 2 -4" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 134 48 L 142 54 L 164 116 L 132 132 L 118 130 L 94 120 L 110 90 L 132 132 L 106 72" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 102 64 l -2 2 l -6 -10 l 2 -2 l 6 10" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 102 66 l -4 2 l 4 6 l 2 2 l 6 14" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 112 88 L 120 72" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 132 62 L 128 20 L 122 52 L 122 64 L 124 60 L 128 114 L 130 80 L 130 68 L 132 62" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 130 40 l -2 -2 l -4 2 l 2 2 l 4 -2 l -2 6 l 0 4 l -2 0 l 0 -8 l -2 -2 l 2 6" ] []
            ]

        Thing.Demon ->
            [ Svg.path [ stroke color, fill "transparent", d "M 124 64 l -4 8 l 0 -8 l -10 14 l -8 -14 l 8 -6 l 8 -4 l 2 -4 l 2 -4 l -6 -6 l -8 2 l 12 -14 l 6 0" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 130 28 l 6 0 l 10 8 l 2 14 l -12 -6 l -4 2 l 2 2 l 2 -4" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 134 48 L 142 54 L 164 116 L 132 132 L 118 130 L 94 120 L 110 90 L 132 132 L 106 72" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 102 64 l -2 2 l -6 -10 l 2 -2 l 6 10" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 102 66 l -4 2 l 4 6 l 2 2 l 6 14" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 112 88 L 120 72" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 132 62 L 128 20 L 122 52 L 122 64 L 124 60 L 128 114 L 130 80 L 130 68 L 132 62" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 130 40 l -2 -2 l -4 2 l 2 2 l 4 -2 l -2 6 l 0 4 l -2 0 l 0 -8 l -2 -2 l 2 6" ] []
            ]

        Thing.Viper ->
            [ Svg.path [ stroke color, fill "transparent", d "M 130 132 L 122 112 L 124 92 L 126 94 L 130 94 L 132 92 L 130 112 L 140 128 L 136 132 L 114 132 L 108 120 L 118 106 L 112 120 L 116 124 L 126 124" ] []
            , Svg.path [ stroke color, fill "transparent", d "M 120 100 l 0 -4 l 4 -4 l -4 -4 l 0 -4 l 2 -2 l 4 4 l -4 -4 l 12 0 l -4 4 l 4 -4 l 2 2 l 0 4 l -4 4 l 4 4 l 0 4" ] []
            ]

        _ ->
            []
