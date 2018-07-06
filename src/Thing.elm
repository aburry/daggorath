module Thing exposing (..)

import Dict exposing (..)
import Maybe exposing (..)


type Thing
    = Error
    | Shield
    | Torch
    | Sword
    | Flask
    | Ring
    | Scroll
    | Empty
    | LeatherShield
    | BronzeShield
    | MithrilShield
    | GiantShield
    | WoodenSword
    | IronSword
    | ElvishSword
    | DeadTorch
    | PineTorch
    | LunarTorch
    | SolarTorch
    | EmptyFlask
    | HaleFlask
    | AbyeFlask
    | ThewsFlask
    | GoldRing
    | VulcanRing
    | FireRing
    | SupremeRing
    | FinalRing
    | JouleRing
    | EnergyRing
    | RimeRing
    | IceRing
    | VisionScroll
    | SeerScroll
    | LeftWall
    | LeftOpen
    | LeftDoor
    | LeftMagicDoor
    | RightWall
    | RightOpen
    | RightDoor
    | RightMagicDoor
    | FrontWall
    | FrontOpen
    | FrontDoor
    | FrontMagicDoor
    | LadderCeiling
    | BackWall
    | BackOpen
    | BackDoor
    | BackMagicDoor
    | LadderFloor
    | HoleFloor
    | HoleCeiling
    | Ceiling
    | Floor
    | CreatureLeft
    | CreatureRight
    | Spider
    | Viper
    | ClubGiant
    | Blob
    | HatchetGiant
    | Knight
    | ShieldKnight
    | Scorpion
    | Demon
    | Wraith
    | Galdrog
    | MoonWizard
    | StarWizard
    | Border
    | Heart
    | CreatureDied
    | CreatureHitPlayer
    | PlayerHitCreature
    | PlayerHitWall
    | WizardFadeBuzz
    | WizardFadeCrash


serializeThing : Thing -> String
serializeThing x =
    case x of
        Error ->
            "Error"

        Shield ->
            "Shield"

        Torch ->
            "Torch"

        Sword ->
            "Sword"

        Flask ->
            "Flask"

        Ring ->
            "Ring"

        Scroll ->
            "Scroll"

        Empty ->
            "Empty"

        LeatherShield ->
            "LeatherShield"

        BronzeShield ->
            "BronzeShield"

        MithrilShield ->
            "MithrilShield"

        GiantShield ->
            "GiantShield"

        WoodenSword ->
            "WoodenSword"

        IronSword ->
            "IronSword"

        ElvishSword ->
            "ElvishSword"

        DeadTorch ->
            "DeadTorch"

        PineTorch ->
            "PineTorch"

        LunarTorch ->
            "LunarTorch"

        SolarTorch ->
            "SolarTorch"

        EmptyFlask ->
            "EmptyFlask"

        HaleFlask ->
            "HaleFlask"

        AbyeFlask ->
            "AbyeFlask"

        ThewsFlask ->
            "ThewsFlask"

        GoldRing ->
            "GoldRing"

        VulcanRing ->
            "VulcanRing"

        FireRing ->
            "FireRing"

        SupremeRing ->
            "SupremeRing"

        FinalRing ->
            "FinalRing"

        JouleRing ->
            "JouleRing"

        RimeRing ->
            "RimeRing"

        EnergyRing ->
            "EnergyRing"

        IceRing ->
            "IceRing"

        VisionScroll ->
            "VisionScroll"

        SeerScroll ->
            "SeerScroll"

        LeftWall ->
            "LeftWall"

        LeftOpen ->
            "LeftOpen"

        LeftDoor ->
            "LeftDoor"

        LeftMagicDoor ->
            "LeftMagicDoor"

        RightWall ->
            "RightWall"

        RightOpen ->
            "RightOpen"

        RightDoor ->
            "RightDoor"

        RightMagicDoor ->
            "RightMagicDoor"

        FrontWall ->
            "FrontWall"

        FrontOpen ->
            "FrontOpen"

        FrontDoor ->
            "FrontDoor"

        FrontMagicDoor ->
            "FrontMagicDoor"

        LadderCeiling ->
            "LadderCeiling"

        BackWall ->
            "BackWall"

        BackOpen ->
            "BackOpen"

        BackDoor ->
            "BackDoor"

        BackMagicDoor ->
            "BackMagicDoor"

        LadderFloor ->
            "LadderFloor"

        HoleFloor ->
            "HoleFloor"

        HoleCeiling ->
            "HoleCeiling"

        Ceiling ->
            "Ceiling"

        Floor ->
            "Floor"

        CreatureLeft ->
            "CreatureLeft"

        CreatureRight ->
            "CreatureRight"

        Spider ->
            "Spider"

        Viper ->
            "Viper"

        ClubGiant ->
            "ClubGiant"

        Blob ->
            "Blob"

        HatchetGiant ->
            "HatchetGiant"

        Knight ->
            "Knight"

        ShieldKnight ->
            "ShieldKnight"

        Scorpion ->
            "Scorpion"

        Demon ->
            "Demon"

        Wraith ->
            "Wraith"

        Galdrog ->
            "Galdrog"

        MoonWizard ->
            "MoonWizard"

        StarWizard ->
            "StarWizard"

        Border ->
            "Border"

        Heart ->
            "Heart"

        CreatureDied ->
            "CreatureDied"

        CreatureHitPlayer ->
            "CreatureHitPlayer"

        PlayerHitCreature ->
            "PlayerHitCreature"

        PlayerHitWall ->
            "PlayerHitWall"

        WizardFadeBuzz ->
            "WizardFadeBuzz"

        WizardFadeCrash ->
            "WizardFadeCrash"


deserializeThing : String -> Thing
deserializeThing x =
    let
        dict =
            Dict.fromList
                [ ( "Error", Error )
                , ( "Shield", Shield )
                , ( "Torch", Torch )
                , ( "Sword", Sword )
                , ( "Flask", Flask )
                , ( "Ring", Ring )
                , ( "Scroll", Scroll )
                , ( "Empty", Empty )
                , ( "LeatherShield", LeatherShield )
                , ( "BronzeShield", BronzeShield )
                , ( "MithrilShield", MithrilShield )
                , ( "GiantShield", GiantShield )
                , ( "WoodenSword", WoodenSword )
                , ( "IronSword", IronSword )
                , ( "ElvishSword", ElvishSword )
                , ( "DeadTorch", DeadTorch )
                , ( "PineTorch", PineTorch )
                , ( "LunarTorch", LunarTorch )
                , ( "SolarTorch", SolarTorch )
                , ( "EmptyFlask", EmptyFlask )
                , ( "HaleFlask", HaleFlask )
                , ( "AbyeFlask", AbyeFlask )
                , ( "ThewsFlask", ThewsFlask )
                , ( "GoldRing", GoldRing )
                , ( "VulcanRing", VulcanRing )
                , ( "FireRing", FireRing )
                , ( "SupremeRing", SupremeRing )
                , ( "FinalRing", FinalRing )
                , ( "JouleRing", JouleRing )
                , ( "RimeRing", RimeRing )
                , ( "EnergyRing", EnergyRing )
                , ( "IceRing", IceRing )
                , ( "VisionScroll", VisionScroll )
                , ( "SeerScroll", SeerScroll )
                , ( "LeftWall", LeftWall )
                , ( "LeftOpen", LeftOpen )
                , ( "LeftDoor", LeftDoor )
                , ( "LeftMagicDoor", LeftMagicDoor )
                , ( "RightWall", RightWall )
                , ( "RightOpen", RightOpen )
                , ( "RightDoor", RightDoor )
                , ( "RightMagicDoor", RightMagicDoor )
                , ( "FrontWall", FrontWall )
                , ( "FrontOpen", FrontOpen )
                , ( "FrontDoor", FrontDoor )
                , ( "FrontMagicDoor", FrontMagicDoor )
                , ( "LadderCeiling", LadderCeiling )
                , ( "BackWall", BackWall )
                , ( "BackOpen", BackOpen )
                , ( "BackDoor", BackDoor )
                , ( "BackMagicDoor", BackMagicDoor )
                , ( "LadderFloor", LadderFloor )
                , ( "HoleFloor", HoleFloor )
                , ( "HoleCeiling", HoleCeiling )
                , ( "Ceiling", Ceiling )
                , ( "Floor", Floor )
                , ( "CreatureLeft", CreatureLeft )
                , ( "CreatureRight", CreatureRight )
                , ( "Spider", Spider )
                , ( "Viper", Viper )
                , ( "ClubGiant", ClubGiant )
                , ( "Blob", Blob )
                , ( "HatchetGiant", HatchetGiant )
                , ( "Knight", Knight )
                , ( "ShieldKnight", ShieldKnight )
                , ( "Scorpion", Scorpion )
                , ( "Demon", Demon )
                , ( "Wraith", Wraith )
                , ( "Galdrog", Galdrog )
                , ( "MoonWizard", MoonWizard )
                , ( "StarWizard", StarWizard )
                , ( "Border", Border )
                , ( "Heart", Heart )
                , ( "CreatureDied", CreatureDied )
                , ( "CreatureHitPlayer", CreatureHitPlayer )
                , ( "PlayerHitCreature", PlayerHitCreature )
                , ( "PlayerHitWall", PlayerHitWall )
                , ( "WizardFadeBuzz", WizardFadeBuzz )
                , ( "WizardFadeCrash", WizardFadeCrash )
                ]

        e =
            get x dict
    in
    case e of
        Nothing ->
            Error

        Just v ->
            v
