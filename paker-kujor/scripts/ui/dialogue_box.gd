extends Control

@onready var panel: PanelContainer = $Panel
@onready var speaker_label: Label = $Panel/Margin/HBox/Speaker
@onready var text_label: Label = $Panel/Margin/HBox/Text
@onready var hint_label: Label = $Panel/Margin/HBox/Hint

var _visible_state: bool = false


func _ready() -> void:
	hide_box()
	DialogueManager.register_dialogue_box(self)
	process_mode = Node.PROCESS_MODE_ALWAYS


func show_box(speaker: String, text: String) -> void:
	_visible_state = true
	visible = true
	speaker_label.text = speaker
	text_label.text = text
	hint_label.visible = false


func hide_box() -> void:
	_visible_state = false
	visible = false


func set_text(text: String) -> void:
	text_label.text = text


func show_advance_hint(show: bool) -> void:
	hint_label.visible = show
	if show:
		hint_label.text = "▼ Z"


func _unhandled_input(event: InputEvent) -> void:
	if not _visible_state:
		return
	if event.is_action_pressed("interact"):
		DialogueManager.advance()
		get_viewport().set_input_as_handled()
