extends Node

@onready var title_screen: Control = $TitleScreen
@onready var basement: Node2D = $Basement


func _ready() -> void:
	title_screen.start_game.connect(_on_start)
	title_screen.continue_game.connect(_on_continue)
	basement.visible = false


func _on_start() -> void:
	title_screen.visible = false
	basement.visible = true
	if basement.has_method("enter_room"):
		basement.enter_room()


func _on_continue() -> void:
	title_screen.visible = false
	basement.visible = true
	if basement.has_method("enter_room"):
		basement.enter_room()
