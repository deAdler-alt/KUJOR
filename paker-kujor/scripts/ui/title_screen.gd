extends Control

signal start_game
signal continue_game

@onready var start_btn: Button = $VBox/StartBtn
@onready var continue_btn: Button = $VBox/ContinueBtn
@onready var title_label: Label = $VBox/Title
@onready var subtitle_label: Label = $VBox/Subtitle


func _ready() -> void:
	start_btn.pressed.connect(_on_start)
	continue_btn.pressed.connect(_on_continue)
	continue_btn.visible = SaveManager.has_save()
	process_mode = Node.PROCESS_MODE_ALWAYS


func _on_start() -> void:
	GameState.reset_new_game()
	start_game.emit()


func _on_continue() -> void:
	if SaveManager.load_game():
		continue_game.emit()
